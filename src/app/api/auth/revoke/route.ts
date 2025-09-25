import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { revokeToken } from '@/lib/jwt';
import { randomUUID } from 'crypto';

export interface RevokeRequest {
  token?: string; // Optional - if not provided, will revoke the token used for auth
}

export interface RevokeResponse {
  success: true;
  data: {
    message: string;
    revokedAt: string;
  };
}

export interface RevokeErrorResponse {
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
 * POST /api/auth/revoke
 * 
 * Revoke JWT token (logout)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  try {
    // Authenticate the request first
    const authResult = await authenticate(req, {
      requireAuth: true,
      permissions: [], // No specific permissions required for logout
    });

    // Use property existence narrowing in case the discriminant union wasn't preserved
    if ('response' in authResult) {
      return authResult.response;
    }

    const { isLegacyAuth } = authResult.context;

    // Legacy auth (API keys) cannot be revoked via this endpoint
    if (isLegacyAuth) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'legacy_auth_not_supported',
            message: 'Cannot revoke API key tokens',
            details: 'API key authentication cannot be revoked. Use JWT authentication for token revocation.',
            requestId,
            timestamp,
          },
        } as RevokeErrorResponse,
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
          }
        }
      );
    }

    // Parse request body to check if specific token should be revoked
    let body: RevokeRequest = {};
    try {
      const requestBody = await req.text();
      if (requestBody.trim()) {
        body = JSON.parse(requestBody);
      }
    } catch (error) {
      // If JSON parsing fails, continue with empty body (will revoke current token)
    }

    // Get token to revoke
    let tokenToRevoke: string;
    
    if (body.token) {
      // Revoke specific token
      tokenToRevoke = body.token;
    } else {
      // Revoke the token used for authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'no_token_found',
              message: 'No token to revoke',
              details: 'Provide a token in the request body or use Bearer authentication',
              requestId,
              timestamp,
            },
          } as RevokeErrorResponse,
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
            }
          }
        );
      }
      
      tokenToRevoke = authHeader.substring(7).trim();
    }

    // Revoke the token
    try {
      await revokeToken(tokenToRevoke);

      const response: RevokeResponse = {
        success: true,
        data: {
          message: 'Token successfully revoked',
          revokedAt: timestamp,
        },
      };

      return NextResponse.json(response, { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token revocation failed';
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'revocation_failed',
            message: 'Failed to revoke token',
            details: errorMessage,
            requestId,
            timestamp,
          },
        } as RevokeErrorResponse,
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
          }
        }
      );
    }

  } catch (error) {
    console.error('Token revocation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'internal_error',
          message: 'Internal server error',
          details: 'An unexpected error occurred during token revocation',
          requestId,
          timestamp,
        },
      } as RevokeErrorResponse,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
        }
      }
    );
  }
}

/**
 * OPTIONS /api/auth/revoke
 * 
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
    },
  });
}
