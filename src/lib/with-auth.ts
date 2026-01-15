import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AppError, ERROR_CODES } from '@/lib/errors';
import { ZodError } from 'zod';
import { Prisma } from '@/lib/prisma';

/**
 * Type for authenticated user in route context
 * Simplified to only include id since API key authentication doesn't return full user data
 */
type AuthenticatedUser = {
  id: string;
};

/**
 * Route handler with authenticated user in context
 */
type AuthenticatedRouteHandler<T = any> = (
  request: Request,
  context: { params: T; user: AuthenticatedUser }
) => Promise<Response>;

/**
 * Higher-order function that wraps API route handlers with authentication
 * 
 * Supports two authentication methods:
 * 1. API Key (via x-api-key header)
 * 2. Cookie session (default Better Auth flow)
 * 
 * Usage:
 * ```ts
 * export const GET = withAuth(async (request, { params, user }) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ userId: user.id });
 * });
 * ```
 */
export function withAuth<T = any>(
  handler: AuthenticatedRouteHandler<T>
) {
  return async (
    request: Request,
    routeContext: { params: T }
  ): Promise<Response> => {
    try {
      // Check for API key authentication
      const apiKey = request.headers.get('x-api-key');
      
      if (apiKey) {
        // Verify API key using Better Auth
        const verificationResult = await auth.api.verifyApiKey({
          headers: request.headers as any,
          body: {
            key: apiKey
          }
        });

        // Check if verification was successful
        if (!verificationResult.valid || !verificationResult.key) {
          return NextResponse.json(
            { error: 'Invalid API key', code: ERROR_CODES.UNAUTHORIZED },
            { status: 401 }
          );
        }

        // Call handler with API key authenticated context
        return await handler(request, {
          ...routeContext,
          user: { id: verificationResult.key.userId }
        });
      }

      // Fall back to cookie session authentication
      const session = await auth.api.getSession({
        headers: request.headers as any
      });

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: ERROR_CODES.UNAUTHORIZED },
          { status: 401 }
        );
      }

      // Call handler with session authenticated context
      return await handler(request, {
        ...routeContext,
        user: { id: session.user.id }
      });

    } catch (error) {
      console.error('API Route Error:', error);
      
      // Handle custom application errors
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            code: ERROR_CODES.VALIDATION_ERROR,
            details: error.issues 
          },
          { status: 400 }
        );
      }

      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Common Prisma error codes:
        // P2002: Unique constraint violation
        // P2025: Record not found
        // P2003: Foreign key constraint violation
        
        if (error.code === 'P2002') {
          return NextResponse.json(
            { 
              error: 'A record with this value already exists',
              code: ERROR_CODES.CONFLICT 
            },
            { status: 409 }
          );
        }
        
        if (error.code === 'P2025') {
          return NextResponse.json(
            { 
              error: 'Record not found',
              code: ERROR_CODES.NOT_FOUND 
            },
            { status: 404 }
          );
        }
        
        return NextResponse.json(
          { 
            error: 'Database operation failed',
            code: ERROR_CODES.DATABASE_ERROR 
          },
          { status: 400 }
        );
      }

      // Generic fallback for unknown errors
      return NextResponse.json(
        { 
          error: 'Internal server error',
          code: ERROR_CODES.INTERNAL_SERVER_ERROR 
        },
        { status: 500 }
      );
    }
  };
}

