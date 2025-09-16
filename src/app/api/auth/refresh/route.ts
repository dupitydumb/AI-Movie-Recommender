import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/jwt';
import { getCORSHeaders } from '@/lib/auth-middleware';
import { randomUUID } from 'crypto';

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: 'Bearer';
  };
}

export interface RefreshErrorResponse {
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
 * POST /api/auth/refresh
 * 
 * Refresh access token using refresh token
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const headers = getCORSHeaders();

  try {
    // Parse request body
    let body: RefreshRequest;
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
        } as RefreshErrorResponse,
        { status: 400, headers }
      );
    }

    // Validate required fields
    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'missing_refresh_token',
            message: 'Refresh token is required',
            details: 'Provide your refresh token in the request body',
            requestId,
            timestamp,
          },
        } as RefreshErrorResponse,
        { status: 400, headers }
      );
    }

    // Refresh the access token
    try {
      const newTokens = await refreshAccessToken(body.refreshToken);

      const response: RefreshResponse = {
        success: true,
        data: newTokens,
      };

      return NextResponse.json(response, { status: 200, headers });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      let errorCode = 'token_refresh_failed';
      let status = 401;

      if (errorMessage.includes('expired')) {
        errorCode = 'refresh_token_expired';
      } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
        errorCode = 'invalid_refresh_token';
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: 'Token refresh failed',
            details: errorMessage,
            requestId,
            timestamp,
          },
        } as RefreshErrorResponse,
        { status, headers }
      );
    }

  } catch (error) {
    console.error('Refresh token error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'internal_error',
          message: 'Internal server error',
          details: 'An unexpected error occurred during token refresh',
          requestId,
          timestamp,
        },
      } as RefreshErrorResponse,
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/auth/refresh
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
  });
}
