'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Pricing() {
    const router = useRouter();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSubscribe = async (tierId: string) => {
        if (tierId === 'free') {
            router.push('/signup');
            return;
        }

        if (tierId === 'enterprise') {
            window.location.href = 'mailto:sales@hireneo.ai?subject=Enterprise Plan Inquiry';
            return;
        }

        // Check if user is logged in
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push(`/login?redirectTo=/pricing`);
            return;
        }

        setLoadingTier(tierId);

        try {
            const res = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tierId }),
            });

            const data = await res.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                console.error('Checkout error:', data.error);
                alert('Failed to start checkout. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <section className="py-20 px-4 relative overflow-hidden bg-[#FAFAF9]" id="pricing">
            {/* Background Glows to blend with page */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1A3305]/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                        Simple pricing for <span className="text-[#1A3305]">smart hiring</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your recruitment needs. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">

                    {/* Tier 1: Starter (Free) */}
                    <div className="relative group h-full">
                        {/* Abstract Orb - Blue/Slate - Added Glow */}
                        <div className="absolute -top-10 -left-6 w-32 h-32 z-0 opacity-60 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-slate-200 blur-[40px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-transparent blur-[30px] opacity-70"></div>
                        </div>

                        {/* Abstract Orb - Yellow/Gold (Added for symmetry) - MOVED TO LEFT */}
                        <div className="absolute -bottom-8 -left-6 w-24 h-24 z-0 opacity-40 transition-transform duration-700 group-hover:scale-110 delay-100">
                            <div className="w-full h-full rounded-full bg-orange-200 blur-[40px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 to-transparent blur-[20px]"></div>
                        </div>

                        <div className="relative z-10 bg-white p-6 rounded-[2rem] border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto w-full overflow-hidden">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none"></div>

                            <div className="mb-6 relative z-30">
                                <h3 className="font-heading text-xl font-bold mb-1 text-slate-700">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">$0</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Perfect for trying out AI interviews.</p>
                            </div>

                            <div className="space-y-3 mb-8 relative z-30">
                                {[
                                    "2 Active Job Roles",
                                    "10 AI Interviews / mo",
                                    "Basic Candidate Scoring",
                                    "Standard Email Alerts"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-slate-600" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handleSubscribe('free')}
                                disabled={loadingTier === 'free'}
                                className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-900 h-10 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02] relative z-30"
                            >
                                {loadingTier === 'free' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Free'}
                            </Button>
                        </div>
                    </div>

                    {/* Tier 2: Growth (Pro) - Highlight */}
                    <div className="relative group scale-105 z-20">
                        {/* Abstract Orb - Green/Primary - REDUCED DARKNESS */}
                        <div className="absolute -top-12 -right-8 w-40 h-40 z-0 opacity-40 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-[#1A3305]/60 blur-[50px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-300 to-transparent blur-[30px] opacity-60"></div>
                        </div>

                        <div className="relative z-10 bg-white p-8 rounded-[2rem] border-2 border-[#1A3305]/10 shadow-2xl hover:shadow-[0_20px_40px_rgba(26,51,5,0.1)] transition-all duration-300 max-w-sm mx-auto w-full overflow-hidden">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-20 pointer-events-none"></div>

                            <div className="absolute top-0 right-0 p-4 z-30">
                                <span className="bg-[#1A3305]/10 text-[#1A3305] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#1A3305]/20">
                                    Popular
                                </span>
                            </div>

                            <div className="mb-8 relative z-30">
                                <h3 className="font-heading text-2xl font-bold mb-1 text-[#1A3305]">Growth</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight">$49</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">For growing teams and startups.</p>
                            </div>

                            <div className="space-y-4 mb-8 relative z-30">
                                {[
                                    "10 Active Job Roles",
                                    "100 AI Interviews / mo",
                                    "Detailed Psychometric Reports",
                                    "Custom Question Generator",
                                    "Priority Support"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                                        <div className="w-5 h-5 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-[#1A3305]" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleSubscribe('pro')}
                                disabled={loadingTier === 'pro'}
                                className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-[#1A3305]/20 transition-transform hover:scale-[1.02] relative z-30"
                            >
                                {loadingTier === 'pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Journey'}
                            </Button>
                        </div>
                    </div>

                    {/* Tier 3: Business (Scale) */}
                    <div className="relative group h-full">
                        {/* Abstract Orb - Gold/Yellow */}
                        <div className="absolute -bottom-8 -right-6 w-36 h-36 z-0 opacity-40 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-orange-300 blur-[40px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-transparent blur-[20px]"></div>
                        </div>

                        <div className="relative z-10 bg-white p-6 rounded-[2rem] border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto w-full overflow-hidden">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none"></div>

                            <div className="mb-6 relative z-30">
                                <h3 className="font-heading text-xl font-bold mb-1 text-slate-800">Business</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">$149</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Power for agencies & volume.</p>
                            </div>

                            <div className="space-y-3 mb-8 relative z-30">
                                {[
                                    "Unlimited Job Roles",
                                    "500 AI Interviews / mo",
                                    "ATS Integration (Webhooks)",
                                    "White-label Portal",
                                    "Dedicated Success Manager"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-yellow-700" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handleSubscribe('enterprise')}
                                disabled={loadingTier === 'enterprise'}
                                className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-900 h-10 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02] relative z-30"
                            >
                                {loadingTier === 'enterprise' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Contact Sales'}
                            </Button>
                        </div>
                    </div>

                </div>

                <div className="text-center mt-12 text-sm text-muted-foreground">
                    Need a custom enterprise plan with unlimited volume? <a href="mailto:sales@hireneo.ai" className="underline font-medium hover:text-foreground">Talk to us</a>
                </div>
            </div>
        </section>
    );
}

