'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log('Subscribe:', email);
        setEmail('');
    };

    return (
        <footer className="bg-[#FAFAF9] border-t border-black/5">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 pt-16 pb-0">
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    {/* Left: Branding */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-16 h-16 bg-[#ECFDF5] rounded-xl flex items-center justify-center border border-[#1A3305]/10">
                                <span className="font-heading font-bold text-3xl text-[#1A3305]">H</span>
                            </div>
                            <h3 className="font-heading font-bold text-3xl">
                                HireNeo<sup className="text-xl">AI</sup>
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
                        <h3 className="font-bold text-xl mb-4">Sign up to our news letter</h3>
                        <form onSubmit={handleSubscribe} className="flex gap-3">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 px-4 py-3 bg-transparent border-b-2 border-dashed border-black/30 focus:border-[#1A3305] outline-none transition-colors"
                                required
                            />
                            <Button
                                type="submit"
                                className="px-8 py-3 bg-[#1A3305] text-white font-bold rounded-lg hover:bg-[#1A3305]/90 transition-colors"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Contact & Social */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="text-sm">
                        Contact Us{' '}
                        <a href="mailto:support@hireneo.ai" className="font-bold hover:underline">
                            support@hireneo.ai
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-24">
                    {/* Company */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                            <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Industry */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Industry</h4>
                        <ul className="space-y-2">
                            <li><Link href="/hiring" className="text-muted-foreground hover:text-foreground transition-colors">Hiring</Link></li>
                            <li><Link href="/interviewing" className="text-muted-foreground hover:text-foreground transition-colors">Interviewing</Link></li>
                            <li><Link href="/recruitment" className="text-muted-foreground hover:text-foreground transition-colors">Recruitment</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Large Watermark */}
                <div className="relative w-full overflow-hidden pb-0 leading-none">
                    <h2 className="font-heading font-bold text-[13vw] text-[#1A3305] opacity-20 text-center uppercase tracking-tighter leading-[0.8]">
                        HireNeoAI
                    </h2>
                </div>
            </div>
        </footer>
    );
}
