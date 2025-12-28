import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
    {
        name: 'Free',
        price: '$0',
        description: 'Perfect for trying out HireNeo AI',
        features: [
            '5 interviews per month',
            '2 AI evaluations per month',
            '1 team member',
            'Email notifications',
            'Basic support',
        ],
        cta: 'Get Started',
        variant: 'outline' as const,
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/month',
        description: 'For growing teams',
        features: [
            'Unlimited interviews',
            '50 AI evaluations per month',
            '5 team members',
            'AI question generator',
            'Structured scorecards',
            'Priority support',
        ],
        cta: 'Start Free Trial',
        variant: 'default' as const,
        popular: true,
    },
    {
        name: 'Team',
        price: '$49',
        period: '/month',
        description: 'For larger organizations',
        features: [
            'Everything in Pro',
            'Unlimited AI evaluations',
            '10 team members',
            'Custom branding',
            'API access',
            'Dedicated support',
        ],
        cta: 'Contact Sales',
        variant: 'outline' as const,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b py-4 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl">HireNeo AI</Link>
                    <div className="flex gap-4">
                        <Link href="/sign-in">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Pricing Header */}
            <section className="py-16 px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that fits your team. No hidden fees.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-4">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={plan.popular ? 'border-primary relative' : ''}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="pt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/sign-up">
                                    <Button variant={plan.variant} className="w-full">
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-muted/50 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
                            <p className="text-muted-foreground text-sm">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">What happens when I reach my evaluation limit?</h3>
                            <p className="text-muted-foreground text-sm">
                                You can upgrade to a higher plan or wait until your next billing cycle for limits to reset.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                            <p className="text-muted-foreground text-sm">
                                Yes! All paid plans include a 14-day free trial. No credit card required.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-muted-foreground text-sm">
                                We accept all major credit cards, debit cards, and PayPal via our payment partner Polar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t px-4">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2024 HireNeo AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
