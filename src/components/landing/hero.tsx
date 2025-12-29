'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Placeholder for the "paper like" illustrations
const PaperIllustration = ({ className, rotate = 0 }: { className?: string, rotate?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, rotate: rotate - 10 }}
        animate={{ opacity: 1, y: 0, rotate: rotate }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={className}
    >
        <div className="relative w-32 h-40 bg-white rounded-sm shadow-md border border-black/10 p-4 transform rotate-2 hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-50"></div>
            <div className="space-y-3 pt-2">
                <div className="h-2 w-3/4 bg-black/10 rounded-full"></div>
                <div className="h-2 w-full bg-black/10 rounded-full"></div>
                <div className="h-2 w-5/6 bg-black/10 rounded-full"></div>
                <div className="h-2 w-full bg-black/5 rounded-full"></div>
                <div className="h-2 w-4/5 bg-black/5 rounded-full"></div>
            </div>
            <div className="absolute -bottom-8 -right-4 font-handwriting text-sm text-black/60 transform -rotate-12">
                Top Talent!
            </div>
        </div>
    </motion.div>
);

export function Hero() {
    return (
        <section className="relative pt-20 pb-32 px-4 overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

                {/* Floating Label */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-[#FDE047] text-black font-medium px-4 py-1.5 rounded-full text-sm mb-8 border border-black/5 shadow-sm transform -rotate-1"
                >
                    <span className="text-lg">✨</span>
                    Next-Gen AI Technology
                </motion.div>

                {/* Headline */}
                <h1 className="font-heading font-bold text-5xl md:text-7xl leading-[1.1] text-foreground mb-8 text-center max-w-4xl mx-auto">
                    AI Interviewer get your dream{' '}
                    <span className="relative inline-block ml-2">
                        <span className="relative z-10 text-foreground">top talent.</span>
                        <span className="absolute -bottom-2 -left-2 -right-2 h-[80%] bg-[#FDE047] -z-0 transform -rotate-2 rounded-sm opacity-90"></span>
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mb-12 leading-relaxed">
                    Configure custom interview questions, integrate with your ATS via webhooks,
                    and get comprehensive performance analysis on every candidate.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link href="/signup">
                        <Button size="lg" className="h-14 px-8 rounded-2xl bg-[#1A3305] text-[#F3F4F6] text-lg font-bold hover:bg-[#1A3305]/90 hover:scale-105 transition-all shadow-xl shadow-[#1A3305]/20">
                            Practice For Free Try Now!
                        </Button>
                    </Link>
                    <Link href="/jobs">
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl bg-white border-black/10 text-lg font-bold hover:bg-gray-50 hover:scale-105 transition-all">
                            Hire Top Talent
                        </Button>
                    </Link>
                </div>

                {/* Social Proof Banner - Below CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center gap-3 mt-8"
                >
                    {/* Avatar Stack */}
                    <div className="flex -space-x-2">
                        {[1, 5, 9, 12, 13].map((img, i) => (
                            <div
                                key={img}
                                className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md bg-gray-100"
                                style={{ zIndex: 5 - i }}
                            >
                                <Image
                                    src={`https://i.pravatar.cc/150?img=${img}`}
                                    alt="User"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Rating and Stats Inline */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-4 h-4 fill-[#FDE047] text-[#FDE047]" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                        <span className="font-bold">4.9/5.0</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Used by <span className="font-bold text-foreground">12,198+</span></span>
                    </div>
                </motion.div>

                {/* Trusted By */}
                <div className="mt-20 pt-8 border-t border-black/5 w-full">
                    <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by Students at</p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple Text Placeholders for Logos to match style */}
                        <span className="text-xl font-bold font-heading">stripe</span>
                        <span className="text-xl font-bold font-heading">HubSpot</span>
                        <span className="text-xl font-bold font-heading">coinbase</span>
                        <span className="text-xl font-bold font-heading">Google</span>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <PaperIllustration className="absolute top-1/3 left-[5%] md:left-[10%] hidden md:block" rotate={-12} />
            <PaperIllustration className="absolute top-1/4 right-[5%] md:right-[10%] hidden md:block" rotate={12} />
        </section>
    );
}
