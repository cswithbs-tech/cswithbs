import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
    const isWritersHubPage = req.nextUrl.pathname.startsWith('/writers-hub');
    const isUnauthorizedPage = req.nextUrl.pathname.startsWith('/admin/unauthorized');

    if (isAuthPage) {
        if (isAuth) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return null;
    }

    if (isAdminPage && !isUnauthorizedPage) {
        // [MODIFICATION] Strict check: Don't redirect if we are already on the admin login page!
        const isAdminLoginPage = req.nextUrl.pathname === '/admin/login';

        if (isAdminLoginPage) {
             // If we are already on the login page, just let it load.
             // (Optionally, if they are already logged in, we could redirect to dashboard here, but let's keep it simple)
             return null;
        }

        if (!isAuth) {
            // If trying to access admin page while not logged in, redirect to login with callback
            const from = req.nextUrl.pathname;
            // Redirect to ADMIN login, not user login
            return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${from}`, req.url));
        }
        
        const roles = Array.isArray(token?.roles) ? (token.roles as string[]) : [];
        if (token?.role && typeof token.role === 'string') {
            const legacyRole = token.role.toUpperCase();
            if (!roles.includes(legacyRole)) roles.push(legacyRole);
        }

        // 1. Check if user has ANY admin-level role
        const hasAdminAccess = roles.some(r => ["ADMIN", "SUPER_ADMIN", "WRITER"].includes(r.toUpperCase()));
        if (!hasAdminAccess) {
             // Logged in but not staff -> Redirect to unauthorized page
            return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
        }

        // 2. Strict Role Checks for Specific Pages
        const isSuperAdminOrAdmin = roles.some(r => ["ADMIN", "SUPER_ADMIN"].includes(r.toUpperCase()));

        // Editors cannot access Users, Analytics, or Settings
        if (
            (req.nextUrl.pathname.startsWith('/admin/users') || 
             req.nextUrl.pathname.startsWith('/admin/analytics') ||
             req.nextUrl.pathname.startsWith('/admin/settings')) && 
            !isSuperAdminOrAdmin
        ) {
            return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
        }
    }

    if (isWritersHubPage) {
        const isHubLoginPage = req.nextUrl.pathname === '/writers-hub/login';
        
        if (isHubLoginPage) {
             return null;
        }

        if (!isAuth) {
            const from = req.nextUrl.pathname;
            return NextResponse.redirect(new URL(`/writers-hub/login?callbackUrl=${from}`, req.url));
        }

        const roles = Array.isArray(token?.roles) ? (token.roles as string[]) : [];
        if (token?.role && typeof token.role === 'string') {
            const legacyRole = token.role.toUpperCase();
            if (!roles.includes(legacyRole)) roles.push(legacyRole);
        }

        const hasAdminAccess = roles.some(r => ["ADMIN", "SUPER_ADMIN", "WRITER"].includes(r.toUpperCase()));
        if (!hasAdminAccess) {
            return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
        }
    }

    // Add pathname to header for Server Components to read
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', req.nextUrl.pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
          // Verify access
          if (req.nextUrl.pathname.startsWith('/admin/unauthorized')) {
               return true; // Allow everyone to see the unauthorized page
          }
          if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
              return true;
          }
          if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/writers-hub')) {
              // We return true here to let the middleware function handle the specific redirects
              // otherwise next-auth's default behavior kicks in which is just a login redirect
              return true; 
          }
          return !!token;
      },
    },
    pages: {
        signIn: '/login',
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/writers-hub/:path*", "/login", "/signup"],
};
