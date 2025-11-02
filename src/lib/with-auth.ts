import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Type for authenticated user from Better Auth session
 */
type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>['user']
>;

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
      // Get session (Better Auth uses cookie cache for performance)
      const session = await auth.api.getSession({
        headers: request.headers as any
      });

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Call handler with authenticated context
      return await handler(request, {
        ...routeContext,
        user: session.user
      });

    } catch (error) {
      console.error('API Route Error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
        
        // You can add more specific error handling here
        // e.g., Prisma errors, validation errors, etc.
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

