import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PRICING_TIERS } from '@/lib/integrations/polar/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { tier } = await request.json();

        if (!tier || !['pro', 'enterprise'].includes(tier)) {
            return NextResponse.json(
                { error: 'Invalid tier' },
                { status: 400 }
            );
        }

        const tierConfig = PRICING_TIERS[tier as 'pro' | 'enterprise'];
        const productId = tierConfig.productId;

        console.log('Creating checkout for:', { tier, productId, email: user.email });

        if (!productId) {
            console.error('Product ID not configured for tier:', tier);
            console.error('Env POLAR_PRO_PRODUCT_ID:', process.env.POLAR_PRO_PRODUCT_ID);
            return NextResponse.json(
                { error: 'Product not configured' },
                { status: 500 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const checkout = await createCheckoutSession({
            productId,
            customerEmail: user.email!,
            successUrl: `${baseUrl}/dashboard?subscribed=true`,
            metadata: {
                userId: user.id,
                tier,
            },
        });

        console.log('Checkout created:', checkout);

        return NextResponse.json({
            checkoutUrl: checkout.url,
        });
    } catch (error: any) {
        console.error('Checkout error details:', {
            message: error?.message,
            status: error?.status,
            body: error?.body,
            stack: error?.stack,
        });
        return NextResponse.json(
            { error: 'Failed to create checkout session', details: error?.message },
            { status: 500 }
        );
    }
}

