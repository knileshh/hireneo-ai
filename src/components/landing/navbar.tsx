'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Navbar() {
    return (
        <nav className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
            <div className="bg-[#FFFFF0] border-2 border-dashed border-black/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground font-heading font-bold h-10 w-10 flex items-center justify-center rounded-xl text-xl">
                        H
                    </div>
                    <span className="font-heading font-bold text-xl tracking-tight">HireNeo</span>
                </Link>

                {/* Links - Desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {['AI Interview', 'Features', 'For Businesses', 'Pricing'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(' ', '-')}`}
                            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <Link href="/sign-in">
                            <Button variant="outline" className="rounded-full border-black/10 font-bold bg-white hover:bg-white/50">
                                Log In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button className="rounded-full font-bold bg-[#1A3305] text-white hover:bg-[#1A3305]/90 shadow-lg shadow-[#1A3305]/20">
                                It's Free Try Now!
                            </Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button className="rounded-full bg-[#1A3305] text-white hover:bg-[#1A3305]/90">
                                Dashboard
                            </Button>
                        </Link>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
