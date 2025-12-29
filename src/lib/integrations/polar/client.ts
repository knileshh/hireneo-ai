import { Polar } from '@polar-sh/sdk';

// Validate Polar configuration
if (!process.env.POLAR_ACCESS_TOKEN) {
    console.warn('⚠️  POLAR_ACCESS_TOKEN is not set. Polar integration will not work.');
}

// Initialize Polar client
// Note: Polar.sh uses 'production' for the live environment (not 'sandbox')
export const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Pricing tiers configuration
export const PRICING_TIERS = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            '1 active job posting',
            '5 candidates per month',
            'Basic AI resume parsing',
            'Email notifications',
        ],
        limits: {
            jobs: 1,
            candidatesPerMonth: 5,
        },
    },
    pro: {
        name: 'Pro',
        price: 29,
        productId: process.env.POLAR_PRO_PRODUCT_ID,
        features: [
            'Unlimited job postings',
            '100 candidates per month',
            'Advanced AI ranking',
            'AI interview questions',
            'Priority support',
        ],
        limits: {
            jobs: -1, // unlimited
            candidatesPerMonth: 100,
        },
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        productId: process.env.POLAR_ENTERPRISE_PRODUCT_ID,
        features: [
            'Everything in Pro',
            'Unlimited candidates',
            'Custom AI training',
            'White-label options',
            'Dedicated support',
            'API access',
        ],
        limits: {
            jobs: -1,
            candidatesPerMonth: -1,
        },
    },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

// Helper to create checkout session
export async function createCheckoutSession({
    productId,
    customerEmail,
    successUrl,
    metadata,
}: {
    productId: string;
    customerEmail: string;
    successUrl: string;
    metadata?: Record<string, string>;
}) {
    console.log('🔵 Calling Polar checkouts.create with:', { 
        productId, 
        customerEmail, 
        successUrl,
        metadata,
        hasToken: !!process.env.POLAR_ACCESS_TOKEN,
        tokenPrefix: process.env.POLAR_ACCESS_TOKEN?.substring(0, 15) + '...',
    });

    try {
        // Use the checkouts.create method with products array
        const checkout = await polar.checkouts.create({
            products: [productId],
            successUrl,
            customerEmail,
            metadata,  // Fixed: was 'customerMetadata' which doesn't exist in the API
        });

        console.log('✅ Checkout created successfully:', checkout.id);
        return checkout;
    } catch (error: any) {
        console.error('❌ Polar API Error:', {
            message: error?.message,
            statusCode: error?.statusCode,
            body: JSON.stringify(error?.body, null, 2),
            stack: error?.stack?.split('\n').slice(0, 3),
        });
        throw error;
    }
}

// Helper to get customer subscriptions
export async function getCustomerSubscriptions(customerId: string) {
    const subscriptions = await polar.subscriptions.list({
        customerId,
    });

    return subscriptions.result.items;
}

// Helper to check if user has active subscription
export async function hasActiveSubscription(customerEmail: string): Promise<{
    isActive: boolean;
    tier: PricingTier;
}> {
    try {
        const subscriptions = await polar.subscriptions.list({
            // Note: You'll need to lookup customer by email first in production
        });

        const activeSubscription = subscriptions.result.items.find(
            (sub) => sub.status === 'active'
        );

        if (!activeSubscription) {
            return { isActive: false, tier: 'free' };
        }

        // Determine tier based on product
        const productId = activeSubscription.productId;
        if (productId === PRICING_TIERS.enterprise.productId) {
            return { isActive: true, tier: 'enterprise' };
        } else if (productId === PRICING_TIERS.pro.productId) {
            return { isActive: true, tier: 'pro' };
        }

        return { isActive: true, tier: 'free' };
    } catch (error) {
        console.error('Error checking subscription:', error);
        return { isActive: false, tier: 'free' };
    }
}
