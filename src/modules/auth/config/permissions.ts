import { UserRole } from '@/generated/prisma';

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin/users': ['ADMIN'],
  '/admin/categories': ['ADMIN'],
  '/admin/units': ['ADMIN'],
  '/admin/reports': ['ADMIN', 'VIEWER'],
  '/admin/suppliers': ['ADMIN', 'STAFF'],
  '/admin/stock-in': ['ADMIN', 'STAFF'],
  '/admin/emergency-invoices': ['ADMIN', 'STAFF'],
  '/pos': ['ADMIN', 'STAFF'],
  '/admin/dashboard': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/products': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/stock': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/orders': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/store-layout': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/planogram': ['ADMIN', 'STAFF', 'VIEWER'],
  '/admin/shelves': ['ADMIN', 'STAFF', 'VIEWER'],
};

export function hasPermission(path: string, role: UserRole): boolean {
  // Longest prefix match
  let matchedRoute = '';
  for (const route in ROUTE_PERMISSIONS) {
    if (path.startsWith(route) && route.length > matchedRoute.length) {
      matchedRoute = route;
    }
  }

  // If route is not defined in map, default to deny for protected prefixes (handled in middleware)
  if (!matchedRoute) {
    return false;
  }

  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}
