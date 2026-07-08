import { NextResponse, type NextRequest } from 'next/server';
import { hasPermission } from '@/modules/auth/config/permissions';
import { UserRole } from '@/modules/auth/types';
import { decrypt } from '@/shared/lib/session';

// Các route không yêu cầu đăng nhập
const publicRoutes = ['/login', '/api/setup'];

// File tĩnh (css, js, images, ...) không cần kiểm tra
const isStaticFile = (pathname: string) => {
  return pathname.startsWith('/_next') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/) ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/favicon.ico');
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bỏ qua kiểm tra cho các file tĩnh
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  const payload = await decrypt(sessionCookie);

  // Xử lý trang chủ (/)
  if (pathname === '/') {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  // Nếu người dùng đã đăng nhập và đang ở trang /login -> chuyển hướng tới admin
  if (payload && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Nếu đang truy cập trang công khai -> cho phép
  if (publicRoutes.includes(pathname) || pathname === '/403') {
    return NextResponse.next();
  }

  // Các route giao diện cần bảo vệ phân quyền
  const isProtectedUIPath = pathname.startsWith('/admin') || pathname.startsWith('/pos');

  // API routes cần yêu cầu đăng nhập (nhưng API thường tự check quyền bên trong)
  const isApiRoute = pathname.startsWith('/api');

  if (isProtectedUIPath || isApiRoute) {
    if (!payload || !payload.userId) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Chỉ kiểm tra phân quyền (hasPermission) cho các route giao diện
    if (isProtectedUIPath) {
      const role = payload.role as UserRole;
      if (!hasPermission(pathname, role)) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
  }

  // Cập nhật lại thời gian sống của session cookie
  const res = NextResponse.next();

  if (sessionCookie) {
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    res.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (if any)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
