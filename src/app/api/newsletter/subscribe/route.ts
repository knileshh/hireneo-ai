import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { newsletterSubscribers } from '@/lib/db/schema';
import { resendClient } from '@/lib/integrations/resend/client';

const subscribeSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = subscribeSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const { email } = result.data;

        // Insert into DB
        // Use onConflictDoUpdate to handle re-subscriptions
        await db.insert(newsletterSubscribers)
            .values({ email })
            .onConflictDoUpdate({
                target: newsletterSubscribers.email,
                set: { isActive: true, unsubscribedAt: null },
            });

        // Send welcome email
        // We don't await this to keep the response fast, or we can await if we want to ensure delivery before success
        // In Vercel serverless, it's safer to await or use waitUntil, but for this simple app await is fine.
        await resendClient.sendNewsletterWelcome(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}
