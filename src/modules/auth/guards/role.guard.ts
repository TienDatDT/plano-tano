import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { authService } from '../services/auth.service';
import { UserRole, AuthUser } from '../types';
import { createError } from '@/shared/lib/api-response';

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await authService.getServerSession();
  if (!session) {
    redirect('/login');
  }
  if (!allowedRoles.includes(session.role)) {
    redirect('/403');
  }
  return session;
}

export function withRoleGuard(
  roles: UserRole[],
  handler: (req: NextRequest, session: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const session = await authService.getServerSession();
      if (!session) {
        return createError('Unauthorized', 401);
      }
      
      if (!roles.includes(session.role)) {
        return createError('Forbidden', 403);
      }
      
      return handler(req, session);
    } catch (error: any) {
      return createError(error.message || 'Internal Server Error', 500);
    }
  };
}
