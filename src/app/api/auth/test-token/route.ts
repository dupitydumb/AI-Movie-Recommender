import { NextRequest, NextResponse } from 'next/server';
import { jwtManager } from '@/lib/jwt';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Generate test user ID
    const testUserId = `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create test user data with limitations
    const testUserData = {
      id: testUserId,
      email: 'test@developer.local',
      isTestUser: true,
      requestLimit: 100,
      requestCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
    };

    // Store test user data in Redis
    await redis.set(`test_user:${testUserId}`, JSON.stringify(testUserData), {
      ex: 3 * 60 * 60, // 3 hours in seconds
    });

    // Generate JWT tokens with shorter expiry for test
    const tokens = await jwtManager.generateTokens({
      userId: testUserId,
      email: testUserData.email,
      apiKey: 'test-jwt-token',
      plan: 'free',
      rateLimit: {
        requests: 100,
        window: '3h'
      },
      permissions: ['read', 'search', 'details', 'trending', 'top', 'genre'],
    });

    return NextResponse.json({
      success: true,
      tokens,
      user: {
        id: testUserId,
        email: testUserData.email,
        isTestUser: true,
        requestLimit: 100,
        expiresAt: testUserData.expiresAt,
      },
      message: 'Test JWT tokens generated successfully',
    });

  } catch (error) {
    console.error('Test token generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate test tokens',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check test token status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    const decoded = await jwtManager.verifyToken(token);

    // Get test user data
    const testUserData = await redis.get(`test_user:${decoded.userId}`);
    if (!testUserData) {
      return NextResponse.json(
        { success: false, error: 'Test user not found or expired' },
        { status: 404 }
      );
    }

    const userData = JSON.parse(testUserData as string);
    
    return NextResponse.json({
      success: true,
      user: userData,
      tokenValid: true,
      requestsRemaining: Math.max(0, userData.requestLimit - userData.requestCount),
    });

  } catch (error) {
    console.error('Test token check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check test token',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
