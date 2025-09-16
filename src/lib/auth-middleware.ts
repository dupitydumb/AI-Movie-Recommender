import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, validateApiKeyAndGetUserData, type DecodedToken } from './jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

export interface AuthContext {
  user: DecodedToken;
  isLegacyAuth: boolean;
  rateLimit: {
    requests: number;
    window: string;
  };
}

export interface AuthErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    requestId: string;
    timestamp: string;
  };
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  permissions?: string[];
  customRateLimit?: {
    requests: number;
    window: string;
  };
}

/**
 * Authentication middleware that supports both JWT and legacy API key authentication
 */
export class AuthMiddleware {
  private redis: any;
  private rateLimiters: Map<string, any> = new Map();

  constructor() {
    this.redis = Redis.fromEnv();
  }

  /**
   * Main authentication middleware function
   */
  async authenticate(
    req: NextRequest,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ success: true; context: AuthContext } | { success: false; response: NextResponse }> {
    const {
      requireAuth = true,
      permissions = [],
      customRateLimit
    } = options;

    const requestId = randomUUID();
    const timestamp = new Date().toISOString();

    try {
      // Extract authentication from request
      const authResult = await this.extractAuth(req);
      
      if (!authResult.success) {
        if (!requireAuth) {
          // Allow unauthenticated access if not required
          return {
            success: true,
            context: {
              user: this.createGuestUser(),
              isLegacyAuth: false,
              rateLimit: { requests: 10, window: '1h' }
            }
          };
        }

        return {
          success: false,
          response: this.createErrorResponse(401, {
            code: 'authentication_required',
            message: 'Authentication required',
            details: authResult.error,
            requestId,
            timestamp
          })
        };
      }

      const { user, isLegacyAuth } = authResult;

      // Check permissions
      if (permissions.length > 0) {
        const hasPermission = permissions.some(permission => 
          user.permissions?.includes(permission)
        );

        if (!hasPermission) {
          return {
            success: false,
            response: this.createErrorResponse(403, {
              code: 'insufficient_permissions',
              message: 'Insufficient permissions',
              details: `Required permissions: ${permissions.join(', ')}`,
              requestId,
              timestamp
            })
          };
        }
      }

      // Apply rate limiting
      const rateLimit = customRateLimit || user.rateLimit || { requests: 100, window: '1h' };
      
      // For test users, check their custom request limit first
      if (user.userId.startsWith('test_user_')) {
        const testUserCheck = await this.checkTestUserLimit(user.userId);
        if (!testUserCheck.success) {
          return {
            success: false,
            response: this.createErrorResponse(429, {
              code: 'test_user_limit_exceeded',
              message: 'Test token request limit exceeded',
              details: `You have used all ${testUserCheck.limit} requests for this test token.`,
              requestId,
              timestamp
            })
          };
        }
      }
      
      const rateLimitResult = await this.applyRateLimit(user.userId, rateLimit, isLegacyAuth);

      if (!rateLimitResult.success) {
        return {
          success: false,
          response: this.createErrorResponse(429, {
            code: 'rate_limit_exceeded',
            message: 'Rate limit exceeded',
            details: `Limit: ${rateLimit.requests} requests per ${rateLimit.window}`,
            requestId,
            timestamp
          }, rateLimitResult.headers)
        };
      }

      // For test users, update their custom request count
      if (user.userId.startsWith('test_user_')) {
        await this.updateTestUserUsage(user.userId);
      }

      return {
        success: true,
        context: {
          user,
          isLegacyAuth,
          rateLimit
        }
      };

    } catch (error) {
      console.error('Authentication middleware error:', error);
      return {
        success: false,
        response: this.createErrorResponse(500, {
          code: 'authentication_error',
          message: 'Internal authentication error',
          requestId,
          timestamp
        })
      };
    }
  }

  /**
   * Extract and validate authentication from request
   */
  private async extractAuth(req: NextRequest): Promise<
    | { success: true; user: DecodedToken; isLegacyAuth: boolean }
    | { success: false; error: string }
  > {
    const { searchParams } = new URL(req.url);

    // Try JWT authentication first
    const jwtResult = await this.tryJWTAuth(req);
    if (jwtResult.success) {
      return { success: true, user: jwtResult.user, isLegacyAuth: false };
    }

    // Fallback to legacy API key authentication
    const legacyResult = await this.tryLegacyAuth(req, searchParams);
    if (legacyResult.success) {
      return { success: true, user: legacyResult.user, isLegacyAuth: true };
    }

    return { success: false, error: 'No valid authentication found' };
  }

  /**
   * Try JWT authentication
   */
  private async tryJWTAuth(req: NextRequest): Promise<
    | { success: true; user: DecodedToken }
    | { success: false; error: string }
  > {
    try {
      // Extract Bearer token from Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return { success: false, error: 'No Bearer token found' };
      }

      const token = authHeader.substring(7).trim();
      if (!token) {
        return { success: false, error: 'Empty Bearer token' };
      }

      // Verify JWT token
      const user = await verifyToken(token);
      return { success: true, user };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'JWT verification failed' 
      };
    }
  }

  /**
   * Try legacy API key authentication
   */
  private async tryLegacyAuth(req: NextRequest, searchParams: URLSearchParams): Promise<
    | { success: true; user: DecodedToken }
    | { success: false; error: string }
  > {
    try {
      // Extract API key from various sources
      let apiKey = req.headers.get('X-RapidAPI-Key') || 
                   searchParams.get('apiKey') || 
                   '';

      // Also check Authorization header for non-Bearer tokens
      const authHeader = req.headers.get('Authorization');
      if (!apiKey && authHeader && !authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.trim();
      }

      if (!apiKey) {
        return { success: false, error: 'No API key found' };
      }

      // Validate API key and get user data
      const userData = await validateApiKeyAndGetUserData(apiKey);
      if (!userData) {
        return { success: false, error: 'Invalid API key' };
      }

      // Convert to DecodedToken format
      const user: DecodedToken = {
        ...userData,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        iss: process.env.JWT_ISSUER || 'screenpick-api',
        aud: process.env.JWT_AUDIENCE || 'screenpick-users'
      };

      return { success: true, user };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Legacy auth failed' 
      };
    }
  }

  /**
   * Check if test user has exceeded their request limit
   */
  private async checkTestUserLimit(userId: string): Promise<{ success: boolean; limit: number; used: number; remaining: number }> {
    const key = `test_user:${userId}`;
    const data = await this.redis.get(key);
    
    if (!data) {
      return { success: true, limit: 100, used: 0, remaining: 100 };
    }

    // Handle both string and object data from Redis
    let testUserData;
    if (typeof data === 'string') {
      testUserData = JSON.parse(data);
    } else {
      testUserData = data;
    }
    
    const used = testUserData.requestCount || 0;
    const limit = 100; // Test user limit
    
    return {
      success: used < limit,
      limit,
      used,
      remaining: Math.max(0, limit - used)
    };
  }

  /**
   * Update test user usage count
   */
  private async updateTestUserUsage(userId: string): Promise<void> {
    try {
      // Get current test user data
      const userData = await this.redis.get(`test_user:${userId}`);
      
      if (userData) {
        let testUser;
        if (typeof userData === 'string') {
          testUser = JSON.parse(userData);
        } else {
          testUser = userData;
        }
        
        // Increment request count
        testUser.requestCount = (testUser.requestCount || 0) + 1;
        testUser.lastUsed = new Date().toISOString();
        
        // Check if they've exceeded their limit
        if (testUser.requestCount >= testUser.requestLimit) {
          testUser.exhausted = true;
        }
        
        // Store updated data back to Redis with original expiry
        const remainingTTL = await this.redis.ttl(`test_user:${userId}`);
        await this.redis.set(`test_user:${userId}`, JSON.stringify(testUser), {
          ex: Math.max(remainingTTL, 60), // At least 60 seconds remaining
        });
      }
    } catch (error) {
      console.error('Failed to update test user usage:', error);
      // Don't throw error to avoid blocking API requests
    }
  }

  /**
   * Apply rate limiting based on user and plan
   */
  private async applyRateLimit(
    userId: string, 
    rateLimit: { requests: number; window: string },
    isLegacyAuth: boolean
  ): Promise<{ success: boolean; headers?: Record<string, string> }> {
    try {
      const rateLimitKey = `${userId}:${rateLimit.requests}:${rateLimit.window}`;
      
      // Get or create rate limiter for this configuration
      let rateLimiter = this.rateLimiters.get(rateLimitKey);
      if (!rateLimiter) {
        rateLimiter = new Ratelimit({
          redis: this.redis,
          limiter: this.parseRateLimit(rateLimit.requests, rateLimit.window),
          analytics: true,
          prefix: '@upstash/ratelimit',
        });
        this.rateLimiters.set(rateLimitKey, rateLimiter);
      }

      const result = await rateLimiter.limit(userId);
      
      const headers: Record<string, string> = {
        'X-RateLimit-Limit': rateLimit.requests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      };

      if (!result.success) {
        headers['Retry-After'] = Math.ceil((result.reset - Date.now()) / 1000).toString();
        return { success: false, headers };
      }

      return { success: true, headers };

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Allow request to proceed if rate limiting fails
      return { success: true };
    }
  }

  /**
   * Parse rate limit configuration
   */
  private parseRateLimit(requests: number, window: string) {
    // Convert window format to match existing pattern (e.g., "1h" -> "60 m")
    const normalizedWindow = this.normalizeWindow(window);
    return Ratelimit.slidingWindow(requests, normalizedWindow as any);
  }

  /**
   * Normalize window format to match existing Upstash format
   */
  private normalizeWindow(window: string): string {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) {
      return "60 m"; // Default to 60 minutes
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return `${value} s`;
      case 'm': return `${value} m`;
      case 'h': return `${value * 60} m`; // Convert hours to minutes
      case 'd': return `${value * 24 * 60} m`; // Convert days to minutes
      default: return "60 m";
    }
  }

  /**
   * Parse time window string to milliseconds - kept for future use
   */
  private parseTimeWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 60 * 60 * 1000; // Default to 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  /**
   * Create guest user for unauthenticated requests
   */
  private createGuestUser(): DecodedToken {
    return {
      userId: 'guest',
      apiKey: 'guest',
      plan: 'free',
      rateLimit: { requests: 10, window: '1h' },
      permissions: ['read'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      iss: process.env.JWT_ISSUER || 'screenpick-api',
      aud: process.env.JWT_AUDIENCE || 'screenpick-users'
    };
  }

  /**
   * Create standardized error response
   */
  private createErrorResponse(
    status: number,
    error: Omit<AuthErrorResponse['error'], 'requestId' | 'timestamp'> & { requestId: string; timestamp: string },
    headers: Record<string, string> = {}
  ): NextResponse {
    const baseHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
      ...headers
    };

    return NextResponse.json(
      { error },
      { status, headers: baseHeaders }
    );
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Export convenience functions
export const authenticate = (req: NextRequest, options?: AuthMiddlewareOptions) =>
  authMiddleware.authenticate(req, options);

// Export CORS headers helper
export const getCORSHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
});

// Export for OPTIONS handler
export const handleCORS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
  });
};
