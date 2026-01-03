'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('success');
                setEmail('');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <footer className="bg-[#FAFAF9] border-t border-black/5 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 pt-20 pb-12 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    {/* Left: Branding */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <Image
                                src="/logo.png"
                                alt="HireNeo AI"
                                width={64}
                                height={64}
                                className="rounded-xl"
                            />
                            <h3 className="font-heading font-bold text-3xl">
                                HireNeo AI
                            </h3>
                        </div>

                        <div className="flex items-center gap-2 text-sm mb-4">
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                Terms of use
                            </Link>
                            <span className="text-muted-foreground">·</span>
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    {/* Right: Newsletter */}
                    <div>
                        <h3 className="font-bold text-xl mb-4">Sign up to our newsletter</h3>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-4 py-3 bg-transparent border-b-2 border-dashed border-black/30 focus:border-[#1A3305] outline-none transition-colors w-full disabled:opacity-50"
                                required
                                disabled={status === 'loading' || status === 'success'}
                            />
                            <Button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className={`w-full sm:w-auto px-8 py-3 font-bold rounded-lg transition-all ${status === 'success'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : status === 'error'
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-[#1A3305] hover:bg-[#1A3305]/90 text-white'
                                    }`}
                            >
                                {status === 'loading' ? 'wait...' : status === 'success' ? 'Subscribed!' : status === 'error' ? 'Retry' : 'Subscribe'}
                            </Button>
                        </form>
                        {status === 'success' && (
                            <p className="text-green-600 text-sm mt-2">✨ Checks your inbox for a welcome email!</p>
                        )}
                        {status === 'error' && (
                            <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>
                        )}
                    </div>
                </div>

                {/* Contact & Social */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="text-sm">
                        Contact Us{' '}
                        <a href="mailto:support@hireneo-ai.xyz" className="font-bold hover:underline">
                            support@hireneo-ai.xyz
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#1A3305] transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#1A3305] transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#1A3305] transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Dashed Separator */}
                <div className="border-t-2 border-dashed border-black/30 mb-12"></div>

                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                    {/* ... (content inside remains same, no changes needed for inner blocks if just changing container class) ... */}
                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                            <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Industry */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-lg">Industry</h4>
                        <ul className="space-y-2">
                            <li><Link href="/hiring" className="text-muted-foreground hover:text-foreground transition-colors">Hiring</Link></li>
                            <li><Link href="/interviewing" className="text-muted-foreground hover:text-foreground transition-colors">Interviewing</Link></li>
                            <li><Link href="/recruitment" className="text-muted-foreground hover:text-foreground transition-colors">Recruitment</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Massive Full-Width Watermark - Top 75% Visible */}
            <div className="w-full overflow-hidden h-[11vw] flex items-start justify-center">
                <h2
                    className="font-syne font-extrabold text-[18.2vw] text-[#1A3305]/20 text-center uppercase tracking-tighter leading-[0.8] select-none block w-full"
                >
                    HireNeo AI
                </h2>
            </div>
        </footer>
    );
}
