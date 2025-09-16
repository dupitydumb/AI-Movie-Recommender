import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { Redis } from '@upstash/redis';
import { apiKeyManager } from './api-key-manager';

export interface CustomJWTPayload extends JwtPayload {
  userId: string;
  email?: string;
  apiKey: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  rateLimit: {
    requests: number;
    window: string;
  };
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface DecodedToken extends CustomJWTPayload {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

class JWTManager {
  private redis: any;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private jwtRefreshExpiresIn: string;
  private jwtIssuer: string;
  private jwtAudience: string;

  constructor() {
    this.redis = Redis.fromEnv();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.jwtIssuer = process.env.JWT_ISSUER || 'screenpick-api';
    this.jwtAudience = process.env.JWT_AUDIENCE || 'screenpick-users';

    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set in environment variables. Using fallback.');
    }
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(payload: Omit<CustomJWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>): Promise<TokenPair> {
    // Create access token
    const accessToken = jwt.sign(
      payload,
      this.jwtSecret,
      {
        expiresIn: this.jwtExpiresIn,
        issuer: this.jwtIssuer,
        audience: this.jwtAudience,
      } as SignOptions
    );

    // Create refresh token with longer expiry
    const refreshToken = jwt.sign(
      { userId: payload.userId, tokenType: 'refresh' },
      this.jwtSecret,
      {
        expiresIn: this.jwtRefreshExpiresIn,
        issuer: this.jwtIssuer,
        audience: this.jwtAudience,
      } as SignOptions
    );

    // Store refresh token in Redis for validation
    const refreshTokenKey = `refresh_token:${payload.userId}:${this.generateTokenId(refreshToken)}`;
    await this.redis.setex(refreshTokenKey, this.getExpirationSeconds(this.jwtRefreshExpiresIn), 'valid');

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<DecodedToken> {
    try {
      // Check if token is blacklisted
      const tokenId = this.generateTokenId(token);
      const isBlacklisted = await this.redis.get(`blacklist:${tokenId}`);
      
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: this.jwtIssuer,
        audience: this.jwtAudience,
      }) as DecodedToken;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret, {
        issuer: this.jwtIssuer,
        audience: this.jwtAudience,
      }) as any;

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token exists in Redis
      const tokenId = this.generateTokenId(refreshToken);
      const refreshTokenKey = `refresh_token:${decoded.userId}:${tokenId}`;
      const isValid = await this.redis.get(refreshTokenKey);

      if (!isValid) {
        throw new Error('Refresh token not found or expired');
      }

      // Get user data from Redis - try multiple possible keys
      let userData = await this.redis.hgetall(`user:${decoded.userId}`);
      
      if (!userData || Object.keys(userData).length === 0) {
        // Try to find user data by scanning for the user ID
        const userKeys = await this.redis.keys(`user:apikey:*`);
        for (const key of userKeys) {
          const data = await this.redis.hgetall(key);
          if (data && data.userId === decoded.userId) {
            userData = data;
            break;
          }
        }
      }
      
      if (!userData || !userData.apiKey) {
        throw new Error('User data not found');
      }

      // Generate new token pair
      const newTokens = await this.generateTokens({
        userId: decoded.userId,
        email: userData.email,
        apiKey: userData.apiKey,
        plan: userData.plan || 'free',
        rateLimit: typeof userData.rateLimit === 'string'
          ? JSON.parse(userData.rateLimit || '{"requests": 100, "window": "1h"}')
          : userData.rateLimit || { requests: 100, window: '1h' },
        permissions: typeof userData.permissions === 'string'
          ? JSON.parse(userData.permissions || '["read"]')
          : userData.permissions || ['read'],
      });

      // Invalidate old refresh token
      await this.redis.del(refreshTokenKey);

      return newTokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Revoke a token by adding it to blacklist
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token format');
      }

      const tokenId = this.generateTokenId(token);
      const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
      
      if (expirationTime > 0) {
        await this.redis.setex(`blacklist:${tokenId}`, expirationTime, 'revoked');
      }
    } catch (error) {
      throw new Error('Failed to revoke token');
    }
  }

  /**
   * Validate API key and get user data for JWT generation
   */
  async validateApiKeyAndGetUserData(apiKey: string): Promise<CustomJWTPayload | null> {
    try {
      // Attempt new manager lookup first
      const record = await apiKeyManager.findByApiKey(apiKey);
      if (record) {
        // Check status & expiration
        if (record.status !== 'active') return null;
        if (apiKeyManager.isExpired(record)) {
          // Mark expired
          await apiKeyManager.update(record.keyId, { status: 'expired' });
          return null;
        }
        // Record usage (non-blocking)
        apiKeyManager.recordUsage(record.keyId).catch(()=>{});
        return {
          userId: `user_${record.keyId}`,
            email: record.metadata?.email || undefined,
            apiKey: apiKey,
            plan: record.plan,
            rateLimit: record.rateLimit,
            permissions: record.permissions,
        } as CustomJWTPayload;
      }
    } catch (e) {
      console.warn('ApiKeyManager lookup failed, falling back', e);
    }

    try {
      // Check if API key exists in Redis (current system)
      const storedToken = await this.redis.hget(apiKey, "token");
      
      if (apiKey !== storedToken && apiKey !== process.env.API_KEY && apiKey !== process.env.API_KEY_TEST) {
        return null;
      }

      // Get or create user data for this API key
      let userData = await this.redis.hgetall(`user:apikey:${apiKey}`);
      
      if (!userData || Object.keys(userData).length === 0) {
        // Create default user data for existing API key
        userData = {
          userId: `user_${apiKey.substring(0, 8)}`,
          email: `user_${apiKey.substring(0, 8)}@screenpick.fun`,
          apiKey: apiKey,
          plan: apiKey === process.env.API_KEY_TEST ? 'free' : 'basic',
          rateLimit: JSON.stringify({
            requests: apiKey === process.env.API_KEY_TEST ? 15 : 100,
            window: apiKey === process.env.API_KEY_TEST ? '60m' : '1m'
          }),
          permissions: JSON.stringify(['read', 'search', 'details']),
          createdAt: new Date().toISOString(),
        };

        // Store user data
        await this.redis.hset(`user:apikey:${apiKey}`, userData);
      }

      return {
        userId: userData.userId,
        email: userData.email,
        apiKey: userData.apiKey,
        plan: userData.plan as any,
        rateLimit: typeof userData.rateLimit === 'string' 
          ? JSON.parse(userData.rateLimit) 
          : userData.rateLimit || { requests: 100, window: '1h' },
        permissions: typeof userData.permissions === 'string' 
          ? JSON.parse(userData.permissions) 
          : userData.permissions || ['read'],
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null;
    }
  }

  /**
   * Generate a unique token ID for blacklisting
   */
  private generateTokenId(token: string): string {
    // Use first 10 characters of token as ID (or implement proper hashing)
    return token.substring(token.length - 10);
  }

  /**
   * Convert time string to seconds
   */
  private getExpirationSeconds(timeString: string): number {
    const timeUnit = timeString.slice(-1);
    const timeValue = parseInt(timeString.slice(0, -1));

    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 60 * 60;
      case 'd': return timeValue * 24 * 60 * 60;
      default: return 24 * 60 * 60; // Default to 24 hours
    }
  }

  /**
   * Get user permissions from token
   */
  getPermissions(token: DecodedToken): string[] {
    return token.permissions || ['read'];
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(token: DecodedToken, permission: string): boolean {
    return token.permissions?.includes(permission) || false;
  }

  /**
   * Get rate limit configuration from token
   */
  getRateLimit(token: DecodedToken): { requests: number; window: string } {
    return token.rateLimit || { requests: 100, window: '1h' };
  }
}

// Export singleton instance
export const jwtManager = new JWTManager();

// Export utility functions for easy access
export const generateTokens = (payload: Omit<CustomJWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>) => 
  jwtManager.generateTokens(payload);

export const verifyToken = (token: string) => 
  jwtManager.verifyToken(token);

export const refreshAccessToken = (refreshToken: string) => 
  jwtManager.refreshAccessToken(refreshToken);

export const revokeToken = (token: string) => 
  jwtManager.revokeToken(token);

export const validateApiKeyAndGetUserData = (apiKey: string) => 
  jwtManager.validateApiKeyAndGetUserData(apiKey);
