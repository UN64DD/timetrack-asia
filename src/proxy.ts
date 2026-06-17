import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/profile'];
const ADMIN_PATHS = ['/admin'];
const ORGANIZER_PATHS = ['/organizer'];
const DEVELOPER_PATHS = ['/developer'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAdmin = ADMIN_PATHS.some(p => pathname.startsWith(p));
  const isOrganizer = ORGANIZER_PATHS.some(p => pathname.startsWith(p));
  const isDeveloper = DEVELOPER_PATHS.some(p => pathname.startsWith(p));
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/forgot-password');

  // Redirect to login if accessing protected routes without session
  if ((isProtected || isAdmin || isOrganizer || isDeveloper) && !session && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for admin/organizer/developer routes
  if (session) {
    const role = session.user?.user_metadata?.role;

    if (isAdmin && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isOrganizer && role !== 'ORGANIZER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (isDeveloper && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect logged-in users away from auth pages
    if (isAuthPage && !pathname.includes('/login')) {
      // Allow /login page for all, redirect from /signup if already logged in
      if (pathname.includes('/signup') || pathname.includes('/forgot-password')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/public|api/webhooks|images|fonts).*)',
  ],
};
