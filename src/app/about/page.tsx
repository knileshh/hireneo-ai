import { Metadata } from 'next';
import Image from 'next/image';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'About Us - HireNeo AI',
    description: 'Learn about our mission to revolutionize hiring with AI.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-4xl font-bold mb-6 font-heading">About HireNeo AI</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-xl text-muted-foreground mb-12">
                        We are on a mission to make hiring fairer, faster, and more effective for everyone through the power of Artificial Intelligence.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                            <p className="mb-4">
                                Founded in 2026, HireNeo AI was born from a frustration with traditional hiring processes that are often slow, biased, and inefficient. We realized that while talent is distributed equally, opportunity is not.
                            </p>
                            <p>
                                By leveraging cutting-edge LLMs and speech analysis, we've built a platform that allows candidates to showcase their true potential beyond a static resume, while saving recruiters hundreds of hours in screening time.
                            </p>
                        </div>
                        <div className="relative h-64 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                                alt="Diverse team collaborating"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-[#FAFAF9] rounded-xl border border-black/5">
                            <h3 className="font-bold text-lg mb-2">Innovation</h3>
                            <p className="text-sm text-gray-600">We push the boundaries of what's possible with AI in recruitment.</p>
                        </div>
                        <div className="p-6 bg-[#FAFAF9] rounded-xl border border-black/5">
                            <h3 className="font-bold text-lg mb-2">Fairness</h3>
                            <p className="text-sm text-gray-600">We design our algorithms to reduce bias and promote meritocracy.</p>
                        </div>
                        <div className="p-6 bg-[#FAFAF9] rounded-xl border border-black/5">
                            <h3 className="font-bold text-lg mb-2">Efficiency</h3>
                            <p className="text-sm text-gray-600">We respect the time of both candidates and recruiters.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
