'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// Icons as simple SVG components
const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
        <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
        <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
        <path d="M6 18a4 4 0 0 1-1.967-.516" />
        <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" /><path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
);

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <BrainIcon />
                            <span className="font-bold text-xl">HireNeo AI</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
                            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
                            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
                            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <SignedOut>
                                <Link href="/sign-in">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button>Get Started</Button>
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 md:py-32 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm mb-6">
                        <SparklesIcon />
                        <span>AI-Powered Interview Evaluations</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Hire Smarter with
                        <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"> AI-Powered </span>
                        Interviews
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Generate tailored interview questions, structured scorecards, and AI evaluations.
                        Make data-driven hiring decisions in minutes, not days.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button size="lg" className="w-full sm:w-auto">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                See How It Works
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-muted/50 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            From scheduling to evaluation — HireNeo AI handles it all
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                                    <BrainIcon />
                                </div>
                                <CardTitle>AI Question Generator</CardTitle>
                                <CardDescription>
                                    Enter a job role and get tailored interview questions instantly.
                                    Technical, behavioral, and situational — all covered.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                                    <ClipboardIcon />
                                </div>
                                <CardTitle>Structured Scorecards</CardTitle>
                                <CardDescription>
                                    Rate candidates on technical skills, communication, culture fit,
                                    and problem-solving. No more messy notes.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                                    <SparklesIcon />
                                </div>
                                <CardTitle>AI Evaluations</CardTitle>
                                <CardDescription>
                                    Get instant AI-powered candidate summaries with scores,
                                    strengths, and risks. Make confident hiring decisions.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground">Three simple steps to better hiring</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                                1
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Schedule Interview</h3>
                            <p className="text-muted-foreground text-sm">
                                Add candidate details and job role. AI generates tailored questions automatically.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                                2
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Fill Scorecard</h3>
                            <p className="text-muted-foreground text-sm">
                                Rate the candidate during or after the interview using our structured scorecard.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                                3
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Get AI Evaluation</h3>
                            <p className="text-muted-foreground text-sm">
                                One click generates a comprehensive evaluation with scores, strengths, and risks.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 px-4">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Hire Smarter?</h2>
                    <p className="text-lg opacity-90 mb-8">
                        Join hundreds of teams making better hiring decisions with AI.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" variant="secondary">
                            Start Your Free Trial
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <BrainIcon />
                            <span className="font-semibold">HireNeo AI</span>
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
                            <Link href="/blog" className="hover:text-foreground">Blog</Link>
                            <Link href="#" className="hover:text-foreground">Privacy</Link>
                            <Link href="#" className="hover:text-foreground">Terms</Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 HireNeo AI. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
