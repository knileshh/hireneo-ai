import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Help Center - HireNeo AI',
    description: 'Guides and FAQs for using HireNeo AI.',
};

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Find answers to common questions and learn how to get the most out of HireNeo AI.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">Getting Started</h3>
                    <p className="text-sm text-gray-600 mb-4">Set up your account and create your first job posting.</p>
                    <Link href="#" className="text-[#1A3305] text-sm font-bold hover:underline">Read Guide →</Link>
                </div>
                <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">Creating Assessments</h3>
                    <p className="text-sm text-gray-600 mb-4">How to generate AI questions and customize interviews.</p>
                    <Link href="#" className="text-[#1A3305] text-sm font-bold hover:underline">Read Guide →</Link>
                </div>
                <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">Reviewing Candidates</h3>
                    <p className="text-sm text-gray-600 mb-4">Understanding AI scores and feedback reports.</p>
                    <Link href="#" className="text-[#1A3305] text-sm font-bold hover:underline">Read Guide →</Link>
                </div>
                <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-2">Account & Billing</h3>
                    <p className="text-sm text-gray-600 mb-4">Manage your subscription and team members.</p>
                    <Link href="#" className="text-[#1A3305] text-sm font-bold hover:underline">Read Guide →</Link>
                </div>
            </div>

            <div className="bg-[#FAFAF9] p-8 rounded-2xl border border-black/5 text-center">
                <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                <p className="mb-6">Our support team is just an email away.</p>
                <Link href="/contact" className="inline-block px-8 py-3 bg-[#1A3305] text-white font-bold rounded-lg hover:bg-[#1A3305]/90 transition-colors">
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
