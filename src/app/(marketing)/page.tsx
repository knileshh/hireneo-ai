'use client';

import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { FeaturesBento } from '@/components/landing/features-bento';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] selection:bg-[#FDE047] selection:text-black">
            <Navbar />

            <main>
                <Hero />
                <FeaturesBento />
            </main>

            {/* Simple Footer to match style */}
            <footer className="py-12 border-t border-black/5 bg-[#F5F5F4]">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div className="font-heading font-bold text-2xl">HireNeo</div>
                    <div className="text-sm text-muted-foreground">© 2024 HireNeo AI</div>
                </div>
            </footer>
        </div>
    );
}
