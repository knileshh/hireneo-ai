import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { welcomeEmailQueue, WelcomeEmailJobData } from '@/lib/queue/factory';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    logger.info({
        hasCode: !!code,
        origin,
        next,
    }, 'Auth callback triggered');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            logger.error({
                error: error.message,
                code: error.code,
            }, 'Failed to exchange code for session');
            return NextResponse.redirect(`${origin}/login?error=auth_failed`);
        }

        if (data.user) {
            // Check if this is a new user (created in last 10 seconds)
            const userCreatedAt = new Date(data.user.created_at).getTime();
            const now = Date.now();
            const isNewUser = (now - userCreatedAt) < 10000; // 10 seconds threshold

            logger.info({
                userId: data.user.id,
                userEmail: data.user.email,
                userCreatedAt: data.user.created_at,
                isNewUser,
                timeSinceCreation: `${(now - userCreatedAt) / 1000}s`,
            }, 'User authenticated');

            if (isNewUser) {
                // Queue welcome email for new users
                const userName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'there';
                const userRole = data.user.user_metadata?.role || 'candidate';

                const welcomeEmailData: WelcomeEmailJobData = {
                    userId: data.user.id,
                    userEmail: data.user.email!,
                    userName,
                    userRole,
                };

                try {
                    await welcomeEmailQueue.add('send-welcome', welcomeEmailData, {
                        jobId: `welcome-${data.user.id}`, // Idempotency key
                    });

                    logger.info({
                        userId: data.user.id,
                        userEmail: data.user.email,
                        userName,
                        userRole,
                    }, 'Welcome email queued for new user');
                } catch (queueError) {
                    // Log but don't fail the authentication
                    logger.error({
                        userId: data.user.id,
                        error: queueError instanceof Error ? queueError.message : 'Unknown error',
                    }, 'Failed to queue welcome email');
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login page if there's an error
    logger.warn('Auth callback completed without user data');
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
