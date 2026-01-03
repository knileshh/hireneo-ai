import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Careers - HireNeo AI',
    description: 'Join our team and help build the future of hiring.',
};

export default function CareersPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">Join Our Team</h1>
            <p className="text-xl text-muted-foreground mb-12">
                We're building the future of hiring. If you're passionate about AI and human potential, we'd love to meet you.
            </p>

            <div className="grid gap-6">
                <div className="p-8 border border-black/10 rounded-2xl bg-white hover:border-[#1A3305] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A3305] transition-colors">Senior Full Stack Engineer</h3>
                            <p className="text-gray-500 mb-4">Remote · Engineering · Full-time</p>
                            <p className="text-gray-600">Lead the development of our core interview assessment platform.</p>
                        </div>
                        <span className="px-4 py-2 bg-[#1A3305]/10 text-[#1A3305] rounded-full text-sm font-bold">Apply</span>
                    </div>
                </div>

                <div className="p-8 border border-black/10 rounded-2xl bg-white hover:border-[#1A3305] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A3305] transition-colors">AI Research Scientist</h3>
                            <p className="text-gray-500 mb-4">Remote · AI/ML · Full-time</p>
                            <p className="text-gray-600">Research and improve our question generation and evaluation models.</p>
                        </div>
                        <span className="px-4 py-2 bg-[#1A3305]/10 text-[#1A3305] rounded-full text-sm font-bold">Apply</span>
                    </div>
                </div>

                <div className="p-8 border border-black/10 rounded-2xl bg-white hover:border-[#1A3305] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A3305] transition-colors">Product Designer</h3>
                            <p className="text-gray-500 mb-4">Remote · Design · Full-time</p>
                            <p className="text-gray-600">Craft intuitive and beautiful experiences for candidates and recruiters.</p>
                        </div>
                        <span className="px-4 py-2 bg-[#1A3305]/10 text-[#1A3305] rounded-full text-sm font-bold">Apply</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-600">Don't see a role that fits? <Link href="/contact" className="text-[#1A3305] font-bold hover:underline">Contact us</Link> anyway!</p>
            </div>
        </div>
    );
}
