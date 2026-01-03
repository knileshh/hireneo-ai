import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Hiring Solutions - HireNeo AI',
    description: 'AI-powered hiring solutions for modern teams.',
};

export default function HiringPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">Smarter Hiring with AI</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Streamline your recruitment process and find the best talent faster.
            </p>

            <div className="grid gap-8 mb-16">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">Automated Screening</h2>
                        <p className="text-gray-600 mb-4">
                            Stop reviewing resumes manually. Our AI analyzes candidate profiles and ranks them based on job fit, saving you hours of time.
                        </p>
                    </div>
                    <div className="flex-1 bg-gray-100 h-64 rounded-xl w-full flex items-center justify-center overflow-hidden shadow-md">
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                            alt="AI Screening Dashboard"
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">Data-Driven Decisions</h2>
                        <p className="text-gray-600 mb-4">
                            Make hiring decisions based on objective data, not gut feeling. Compare candidates side-by-side with detailed scorecards.
                        </p>
                    </div>
                    <div className="flex-1 bg-gray-100 h-64 rounded-xl w-full flex items-center justify-center overflow-hidden shadow-md">
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                            alt="Hiring Analytics"
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#1A3305] text-white p-12 rounded-2xl text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to upgrade your hiring?</h2>
                <Link href="/dashboard" className="inline-block px-8 py-4 bg-white text-[#1A3305] font-bold rounded-xl hover:bg-gray-100 transition-colors">
                    Get Started for Free
                </Link>
            </div>
        </div>
    );
}
