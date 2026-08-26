import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    // ---------------------------------------------------------------------------
    // 1. BOT & SCRAPER PROTECTION
    // ---------------------------------------------------------------------------
    const userAgent = req.headers.get('user-agent') || '';
    
    // Comprehensive list of common scrapers, AI bots, and headless browsers
    const botPatterns = [
        'bot', 'crawler', 'spider', 'crawling', 'scraper',
        'facebookexternalhit', 'GPTBot', 'ClaudeBot', 'anthropic',
        'Bytespider', 'Amazonbot', 'Scrapy', 'curl', 'python-requests', 
        'headless', 'puppeteer', 'playwright', 'wget'
    ];
    
    const isBot = botPatterns.some(pattern => 
        userAgent.toLowerCase().includes(pattern.toLowerCase())
    );

    // Explicitly whitelist Googlebot & Bingbot for SEO purposes
    const isSearchEngine = userAgent.toLowerCase().includes('googlebot') || 
                           userAgent.toLowerCase().includes('bingbot');

    if (isBot && !isSearchEngine) {
        return new NextResponse("Access Denied: Automated bots and crawlers are strictly prohibited on this site.", { status: 403 });
    }

    // ---------------------------------------------------------------------------
    // 2. AUTHENTICATION & ROUTING LOGIC
    // ---------------------------------------------------------------------------
    const pathname = req.nextUrl.pathname;
    
    // Add pathname to header for Server Components to read
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isAdminPage = pathname.startsWith('/admin');
    const isWritersHubPage = pathname.startsWith('/writers-hub');
    const isUnauthorizedPage = pathname.startsWith('/admin/unauthorized');

    // Only invoke NextAuth's getToken if we are on a page that needs auth checking
    if (isAuthPage || isAdminPage || isWritersHubPage) {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const isAuth = !!token;

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/', req.url));
            }
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        if (isAdminPage && !isUnauthorizedPage) {
            const isAdminLoginPage = pathname === '/admin/login';

            if (isAdminLoginPage) {
                 return NextResponse.next({ request: { headers: requestHeaders } });
            }

            if (!isAuth) {
                const from = pathname;
                return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${from}`, req.url));
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

            const isSuperAdminOrAdmin = roles.some(r => ["ADMIN", "SUPER_ADMIN"].includes(r.toUpperCase()));
            if (
                (pathname.startsWith('/admin/users') || 
                 pathname.startsWith('/admin/analytics') ||
                 pathname.startsWith('/admin/settings')) && 
                !isSuperAdminOrAdmin
            ) {
                return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
            }
        }

        if (isWritersHubPage) {
            const isHubLoginPage = pathname === '/writers-hub/login';
            
            if (isHubLoginPage) {
                 return NextResponse.next({ request: { headers: requestHeaders } });
            }

            if (!isAuth) {
                const from = pathname;
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
    }

    // Default pass-through
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
}

// Run on all paths except static assets to ensure bot protection covers courses, blogs, etc.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
