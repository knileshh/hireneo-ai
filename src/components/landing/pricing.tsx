'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Pricing() {
    return (
        <section className="py-20 px-4 relative overflow-hidden bg-[#FAFAF9]" id="pricing">
            {/* Background Glows to blend with page */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1A3305]/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                        Plans for every <span className="text-[#1A3305]">trajectory</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start small or scale up. Choose the trajectory that fits your hiring velocity.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">

                    {/* Tier 1: Orbital (Free) */}
                    <div className="relative group h-full">
                        {/* Abstract Orb - Blue/Slate */}
                        <div className="absolute -top-10 -left-6 w-32 h-32 z-0 opacity-40 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-slate-300 blur-[40px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-transparent blur-[20px]"></div>
                        </div>

                        <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="font-heading text-xl font-bold mb-1 text-slate-700">Orbital</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">$0</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Perfect for trying out AI interviews.</p>
                            </div>

                            <div className="space-y-3 mb-8">
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

                            <Button variant="outline" className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-900 h-10 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02]">
                                Start Free
                            </Button>
                        </div>
                    </div>

                    {/* Tier 2: Stellar (Pro) - Highlight */}
                    <div className="relative group scale-105 z-20">
                        {/* Abstract Orb - Green/Primary */}
                        <div className="absolute -top-12 -right-8 w-40 h-40 z-0 opacity-50 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-[#1A3305] blur-[50px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4ade80] to-transparent blur-[30px] opacity-60"></div>
                        </div>

                        <div className="relative z-10 bg-white/80 backdrop-blur-2xl border-2 border-[#1A3305]/10 rounded-[2rem] p-8 shadow-2xl hover:shadow-[0_20px_40px_rgba(26,51,5,0.1)] transition-all duration-300 max-w-sm mx-auto w-full">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-[#1A3305]/10 text-[#1A3305] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#1A3305]/20">
                                    Popular
                                </span>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-heading text-2xl font-bold mb-1 text-[#1A3305]">Stellar</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight">$49</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">For growing teams and startups.</p>
                            </div>

                            <div className="space-y-4 mb-8">
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

                            <Button className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-[#1A3305]/20 transition-transform hover:scale-[1.02]">
                                Launch Journey
                            </Button>
                        </div>
                    </div>

                    {/* Tier 3: Galactic (Scale) */}
                    <div className="relative group h-full">
                        {/* Abstract Orb - Gold/Yellow */}
                        <div className="absolute -bottom-8 -right-6 w-36 h-36 z-0 opacity-40 transition-transform duration-700 group-hover:scale-110">
                            <div className="w-full h-full rounded-full bg-orange-300 blur-[40px]"></div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-transparent blur-[20px]"></div>
                        </div>

                        <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto w-full">
                            <div className="mb-6">
                                <h3 className="font-heading text-xl font-bold mb-1 text-slate-800">Galactic</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">$149</span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Power for agencies & volume.</p>
                            </div>

                            <div className="space-y-3 mb-8">
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

                            <Button variant="outline" className="w-full bg-white hover:bg-slate-50 border-slate-200 text-slate-900 h-10 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02]">
                                Contact Sales
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
