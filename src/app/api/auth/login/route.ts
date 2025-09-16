import { NextRequest, NextResponse } from 'next/server';
import { validateApiKeyAndGetUserData, generateTokens } from '@/lib/jwt';
import { getCORSHeaders } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';

export interface LoginRequest {
  apiKey: string;
  email?: string;
}

export interface LoginResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: 'Bearer';
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
  };
}

export interface LoginErrorResponse {
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
 * POST /api/auth/login
 * 
 * Exchange API key for JWT tokens
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const headers = getCORSHeaders();

  try {
    // Parse request body
    let body: LoginRequest;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'invalid_request',
            message: 'Invalid JSON in request body',
            details: 'Request body must be valid JSON',
            requestId,
            timestamp,
          },
        } as LoginErrorResponse,
        { status: 400, headers }
      );
    }

    // Validate required fields
    if (!body.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'missing_api_key',
            message: 'API key is required',
            details: 'Provide your API key in the request body',
            requestId,
            timestamp,
          },
        } as LoginErrorResponse,
        { status: 400, headers }
      );
    }

    // Validate API key and get user data
    const userData = await validateApiKeyAndGetUserData(body.apiKey);
    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'invalid_api_key',
            message: 'Invalid API key',
            details: 'The provided API key is not valid or has been revoked',
            requestId,
            timestamp,
          },
        } as LoginErrorResponse,
        { status: 401, headers }
      );
    }

    // Update email if provided
    if (body.email && body.email !== userData.email) {
      userData.email = body.email;
      // Here you could update the email in Redis if needed
    }

    // Generate JWT tokens
    const tokens = await generateTokens(userData);

    // Return successful response
    const response: LoginResponse = {
      success: true,
      data: {
        ...tokens,
        user: {
          userId: userData.userId,
          email: userData.email,
          plan: userData.plan,
          permissions: userData.permissions,
          rateLimit: userData.rateLimit,
        },
      },
    };

    return NextResponse.json(response, { status: 200, headers });

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'internal_error',
          message: 'Internal server error',
          details: 'An unexpected error occurred during login',
          requestId,
          timestamp,
        },
      } as LoginErrorResponse,
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/auth/login
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
  });
}
