import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';

export interface ValidateResponse {
  success: true;
  data: {
    valid: true;
    user: {
      userId: string;
      email?: string;
      plan: string;
      permissions: string[];
      rateLimit: {
        requests: number;
        window: string;
      };
    };
    isLegacyAuth: boolean;
    expiresAt?: string;
  };
}

export interface ValidateErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    requestId: string;
    timestamp: string;
  };
}

/**
 * GET /api/auth/validate
 * 
 * Validate JWT token and return user information
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  try {
    // Use auth middleware to validate token
    const authResult = await authenticate(req, {
      requireAuth: true,
      permissions: [], // No specific permissions required for validation
    });

    if (!authResult.success) {
      return authResult.response;
    }

    const { user, isLegacyAuth } = authResult.context;

    // Calculate expiration time for JWT tokens
    let expiresAt: string | undefined;
    if (!isLegacyAuth && user.exp) {
      expiresAt = new Date(user.exp * 1000).toISOString();
    }

    const response: ValidateResponse = {
      success: true,
      data: {
        valid: true,
        user: {
          userId: user.userId,
          email: user.email,
          plan: user.plan,
          permissions: user.permissions,
          rateLimit: user.rateLimit,
        },
        isLegacyAuth,
        expiresAt,
      },
    };

    return NextResponse.json(response, { 
      status: 200, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'validation_error',
          message: 'Token validation failed',
          details: 'An unexpected error occurred during token validation',
          requestId,
          timestamp,
        },
      } as ValidateErrorResponse,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
        }
      }
    );
  }
}

/**
 * OPTIONS /api/auth/validate
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
    },
  });
}
