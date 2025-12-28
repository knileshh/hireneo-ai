'use client';

import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { FeaturesBento } from '@/components/landing/features-bento';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] selection:bg-[#FDE047] selection:text-black">
            <Navbar />

            <main>
                <Hero />
                <FeaturesBento />
                <Testimonials />
                <Pricing />
                <FAQ />
            </main>

            <Footer />
        </div>
    );
}
