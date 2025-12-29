import { NextRequest, NextResponse } from 'next/server';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

// This endpoint handles Polar webhook events
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('POLAR_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Verify webhook signature
        let event;
        try {
            event = validateEvent(
                body,
                Object.fromEntries(request.headers),
                webhookSecret
            );
        } catch (error) {
            if (error instanceof WebhookVerificationError) {
                console.error('Webhook verification failed:', error.message);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
            throw error;
        }

        // Handle different event types
        switch (event.type) {
            case 'subscription.created':
            case 'subscription.updated':
                await handleSubscriptionUpdate(event.data as any);
                break;

            case 'subscription.canceled':
                await handleSubscriptionCanceled(event.data as any);
                break;

            case 'checkout.created':
                console.log('Checkout created:', event.data.id);
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleSubscriptionUpdate(subscription: {
    id: string;
    status: string;
    customerId: string;
    productId: string;
    metadata?: Record<string, string>;
}) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
        console.log('No userId in subscription metadata');
        return;
    }

    // TODO: Update user subscription status in database
    // For now, we log the subscription update
    console.log('Subscription updated:', {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        productId: subscription.productId,
    });

    // You can add a subscriptions table to track user subscriptions
    // await db.insert(subscriptions).values({...}).onConflictDoUpdate({...});
}

async function handleSubscriptionCanceled(subscription: {
    id: string;
    customerId: string;
    metadata?: Record<string, string>;
}) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
        console.log('No userId in subscription metadata');
        return;
    }

    console.log('Subscription canceled:', {
        userId,
        subscriptionId: subscription.id,
    });

    // Update user to free tier
    // await db.update(users).set({ tier: 'free' }).where(eq(users.id, userId));
}
