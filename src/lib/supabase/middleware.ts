import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protected routes for recruiters
    const recruiterPaths = ['/dashboard'];
    const isRecruiterPath = recruiterPaths.some(path => pathname.startsWith(path));

    // Protected routes for candidates 
    const candidatePaths = ['/candidate'];
    const isCandidatePath = candidatePaths.some(path => pathname.startsWith(path));

    // Redirect to login if accessing protected route without auth
    if ((isRecruiterPath || isCandidatePath) && !user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(url);
    }

    // Role-based access control
    if (user) {
        const role = user.user_metadata?.role;

        // Candidate trying to access recruiter dashboard
        if (isRecruiterPath && role === 'candidate') {
            const url = request.nextUrl.clone();
            url.pathname = '/candidate';
            return NextResponse.redirect(url);
        }

        // Recruiter trying to access candidate dashboard
        if (isCandidatePath && role === 'recruiter') {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    // Redirect logged-in users from auth pages based on role
    const authPaths = ['/login', '/signup'];
    const isAuthPath = authPaths.some(path => pathname === path);

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        const role = user.user_metadata?.role;
        url.pathname = role === 'candidate' ? '/candidate' : '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

