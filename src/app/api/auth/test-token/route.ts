import { NextRequest, NextResponse } from 'next/server';
import { jwtManager } from '@/lib/jwt';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') || 
                    '127.0.0.1';

    // Check if this IP already has an active token today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const ipTokenKey = `daily_token:${today}:${clientIP}`;
    
    const existingTokenData = await redis.get(ipTokenKey);
    
    if (existingTokenData) {
      let tokenInfo;
      
      // Handle both object and string formats from Redis
      try {
        if (typeof existingTokenData === 'string') {
          tokenInfo = JSON.parse(existingTokenData);
        } else if (typeof existingTokenData === 'object' && existingTokenData !== null) {
          tokenInfo = existingTokenData;
        } else {
          throw new Error('Invalid token data format');
        }
      } catch (parseError) {
        console.error('Failed to parse existing token data:', parseError);
        // Clean up corrupted data and continue with new token generation
        await redis.del(ipTokenKey);
        tokenInfo = null;
      }
      
      if (tokenInfo) {
        // Check if the existing token is still valid
        const expiresAt = new Date(tokenInfo.expiresAt);
        const now = new Date();
        
        if (expiresAt > now) {
          // Token is still valid, deny new generation
          const timeRemainingMs = expiresAt.getTime() - now.getTime();
          const hoursRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
          
          // Get current usage of existing token AND the actual tokens
          const existingUserData = await redis.get(`test_user:${tokenInfo.userId}`);
          let requestsUsed = 0;
          let requestsRemaining = 100;
          let actualTokens = null;
          
          if (existingUserData) {
            let userData;
            if (typeof existingUserData === 'string') {
              userData = JSON.parse(existingUserData);
            } else {
              userData = existingUserData;
            }
            requestsUsed = userData.requestCount || 0;
            requestsRemaining = Math.max(0, userData.requestLimit - requestsUsed);
            
            // Get the stored tokens
            actualTokens = userData.tokens || null;
            
            // If tokens are missing, regenerate them (backwards compatibility)
            if (!actualTokens) {
              try {
                actualTokens = await jwtManager.generateTokens({
                  userId: tokenInfo.userId,
                  email: userData.email || 'test@developer.local',
                  apiKey: `test-jwt-${tokenInfo.tokenId}`,
                  plan: 'free',
                  rateLimit: {
                    requests: 100,
                    window: '3h'
                  },
                  permissions: ['read', 'search', 'details', 'trending', 'top', 'genre'],
                });
                
                // Update stored user data with the new tokens
                userData.tokens = actualTokens;
                await redis.set(`test_user:${tokenInfo.userId}`, JSON.stringify(userData), {
                  ex: 3 * 60 * 60, // 3 hours
                });
                
                } catch (tokenError) {
                console.error('Failed to regenerate tokens:', tokenError);
                actualTokens = null;
              }
            }
          }

          // If we still don't have tokens, return an error
          if (!actualTokens) {
            return NextResponse.json({
              success: false,
              error: {
                code: "token_regeneration_failed",
                message: "Failed to retrieve or regenerate your existing token",
                details: "Please try again or wait for your current token to expire.",
              }
            }, { status: 500 });
          }

          return NextResponse.json({
            success: true, // Changed to true since we're providing the existing token
            tokens: actualTokens, // Return the actual tokens
            user: {
              id: tokenInfo.userId,
              tokenId: tokenInfo.tokenId,
              email: 'test@developer.local',
              isTestUser: true,
              requestLimit: 100,
              expiresAt: tokenInfo.expiresAt,
            },
            message: 'Returning your existing active test token',
            isExistingToken: true, // Flag to indicate this is an existing token
            tokenInfo: {
              createdAt: tokenInfo.createdAt,
              expiresAt: tokenInfo.expiresAt,
              timeRemaining: {
                hours: hoursRemaining,
                minutes: minutesRemaining,
                totalMs: timeRemainingMs,
              },
              usage: {
                requestsUsed: requestsUsed,
                requestsRemaining: requestsRemaining,
                requestLimit: 100,
              }
            },
            limits: {
              perDay: 1,
              perIP: true,
              validFor: '3 hours',
              requestLimit: 100,
              nextAllowed: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          });
        } else {
          // Token has expired, clean it up
          await redis.del(ipTokenKey);
          await redis.del(`test_user:${tokenInfo.userId}`);
          if (tokenInfo.tokenId) {
            await redis.del(`test_token:${tokenInfo.tokenId}`);
            await redis.srem('active_test_tokens', tokenInfo.tokenId);
          }
        }
      }
    }

    // Generate new token since no active token exists
    const testUserId = `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
    
    // Create test user data
    const testUserData: any = {
      id: testUserId,
      tokenId: tokenId,
      email: 'test@developer.local',
      isTestUser: true,
      requestLimit: 100,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdByIP: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      active: true,
    };

    // Generate JWT tokens first
    const tokens = await jwtManager.generateTokens({
      userId: testUserId,
      email: testUserData.email,
      apiKey: `test-jwt-${tokenId}`,
      plan: 'free',
      rateLimit: {
        requests: 100,
        window: '3h'
      },
      permissions: ['read', 'search', 'details', 'trending', 'top', 'genre'],
    });

    // Add the generated tokens to user data
    testUserData.tokens = tokens;

    // Store the token info for IP tracking (expires at end of day)
    const ipTokenInfo = {
      userId: testUserId,
      tokenId: tokenId,
      createdAt: testUserData.createdAt,
      expiresAt: testUserData.expiresAt,
      ip: clientIP,
    };

    // Calculate seconds until end of day for IP tracking expiry
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const secondsUntilEndOfDay = Math.ceil((endOfDay.getTime() - Date.now()) / 1000);

    // Store IP token mapping (expires at end of day)
    await redis.set(ipTokenKey, JSON.stringify(ipTokenInfo), {
      ex: secondsUntilEndOfDay,
    });

    // Store test user data with tokens (expires when token expires - 3 hours)
    await redis.set(`test_user:${testUserId}`, JSON.stringify(testUserData), {
      ex: 3 * 60 * 60, // 3 hours
    });

    // Store token mapping for lookups (expires when token expires)
    await redis.set(`test_token:${tokenId}`, testUserId, {
      ex: 3 * 60 * 60, // 3 hours
    });

    // Add to active tokens list
    await redis.sadd('active_test_tokens', tokenId);
    await redis.expire('active_test_tokens', 24 * 60 * 60); // 24 hours

    // Log successful generation
    return NextResponse.json({
      success: true,
      tokens,
      user: {
        id: testUserId,
        tokenId: tokenId,
        email: testUserData.email,
        isTestUser: true,
        requestLimit: 100,
        expiresAt: testUserData.expiresAt,
      },
      message: 'Test JWT tokens generated successfully',
      limits: {
        perDay: 1,
        perIP: true,
        validFor: '3 hours',
        requestLimit: 100,
        nextAllowed: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    });

  } catch (error) {
    console.error('Test token generation error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: "generation_failed",
        message: "Failed to generate test token",
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// GET endpoint to check test token status and usage
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid authorization header"
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await jwtManager.verifyToken(token);
    
    if (!decoded || !decoded.userId.startsWith('test_')) {
      return NextResponse.json({
        success: false,
        error: "Invalid test token"
      }, { status: 401 });
    }

    // Get test user data
    const userData = await redis.get(`test_user:${decoded.userId}`);
    if (!userData) {
      return NextResponse.json({
        success: false,
        tokenValid: false,
        error: "Test token expired or not found"
      }, { status: 404 });
    }

    let testUser;
    try {
      if (typeof userData === 'string') {
        testUser = JSON.parse(userData);
      } else if (typeof userData === 'object' && userData !== null) {
        testUser = userData;
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      return NextResponse.json({
        success: false,
        tokenValid: false,
        error: "Invalid token data"
      }, { status: 500 });
    }
    const requestsRemaining = Math.max(0, testUser.requestLimit - testUser.requestCount);
    const timeRemaining = new Date(testUser.expiresAt).getTime() - Date.now();

    return NextResponse.json({
      success: true,
      tokenValid: true,
      user: {
        id: testUser.id,
        tokenId: testUser.tokenId,
        isTestUser: true,
        createdAt: testUser.createdAt,
        expiresAt: testUser.expiresAt,
      },
      usage: {
        requestsUsed: testUser.requestCount,
        requestsRemaining: requestsRemaining,
        requestLimit: testUser.requestLimit,
        timeRemainingMs: Math.max(0, timeRemaining),
        timeRemainingHours: Math.max(0, Math.round(timeRemaining / (1000 * 60 * 60) * 100) / 100),
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({
      success: false,
      error: "Token validation failed"
    }, { status: 500 });
  }
}

// DELETE endpoint to revoke test token
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: "Missing or invalid authorization header"
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await jwtManager.verifyToken(token);
    
    if (!decoded || !decoded.userId.startsWith('test_')) {
      return NextResponse.json({
        success: false,
        error: "Invalid test token"
      }, { status: 401 });
    }

    // Get test user data to find IP and clean up properly
    const userData = await redis.get(`test_user:${decoded.userId}`);
    if (userData) {
      let testUser;
      try {
        if (typeof userData === 'string') {
          testUser = JSON.parse(userData);
        } else if (typeof userData === 'object' && userData !== null) {
          testUser = userData;
        } else {
          throw new Error('Invalid user data format');
        }
        
        // Remove IP tracking for today
        const today = new Date().toISOString().split('T')[0];
        const ipTokenKey = `daily_token:${today}:${testUser.createdByIP}`;
        await redis.del(ipTokenKey);
        
        // Remove from active tokens
        await redis.srem('active_test_tokens', testUser.tokenId);
        
        // Remove token mapping
        await redis.del(`test_token:${testUser.tokenId}`);
      } catch (parseError) {
        console.error('Failed to parse user data during deletion:', parseError);
        // Continue with deletion even if parsing fails
      }
    }

    // Remove user data
    await redis.del(`test_user:${decoded.userId}`);

    // Add to blacklist
    await jwtManager.revokeToken(token);

    return NextResponse.json({
      success: true,
      message: "Test token revoked successfully"
    });

  } catch (error) {
    console.error('Token revocation error:', error);
    return NextResponse.json({
      success: false,
      error: "Token revocation failed"
    }, { status: 500 });
  }
}
