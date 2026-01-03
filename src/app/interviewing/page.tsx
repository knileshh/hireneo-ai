import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Interviewing Guide - HireNeo AI',
    description: 'Master the art of interviewing with AI.',
};

export default function InterviewingPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">The Future of Interviewing</h1>
            <p className="text-xl text-muted-foreground mb-12">
                How AI is transforming the candidate experience and assessment quality.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <div className="text-4xl mb-4">🎤</div>
                    <h3 className="text-xl font-bold mb-2">Voice Assessments</h3>
                    <p className="text-gray-600">Candidates can answer questions naturally using their voice, allowing for deeper expression than text alone.</p>
                </div>
                <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold mb-2">Adaptive Questions</h3>
                    <p className="text-gray-600">Our AI adjusts follow-up questions based on the candidate's responses to dig deeper into their skills.</p>
                </div>
                <div className="p-6 bg-white border rounded-xl shadow-sm">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold mb-2">Instant Feedback</h3>
                    <p className="text-gray-600">Receive immediate analysis and scoring, identifying strengths and areas for improvement.</p>
                </div>
            </div>

            <div className="text-center">
                <Link href="/jobs" className="text-[#1A3305] font-bold text-lg hover:underline">
                    View demo assessment →
                </Link>
            </div>
        </div>
    );
}
