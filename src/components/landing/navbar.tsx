'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

export function Navbar() {
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user ? { email: data.user.email } : null);
            setLoading(false);
        });
    }, []);

    return (
        <nav className="sticky top-6 z-50 mx-auto max-w-5xl px-4">
            <div className="bg-[#FFFFF0]/95 backdrop-blur-sm border-2 border-dashed border-black/10 rounded-2xl px-6 py-3 flex items-center justify-between shadow-sm">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo-blackline-nobg.png"
                        alt="HireNeo AI"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    />
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
                    {loading ? (
                        <div className="w-20 h-9 bg-gray-200 animate-pulse rounded-full" />
                    ) : user ? (
                        <>
                            <Link href="/dashboard">
                                <Button className="rounded-full bg-[#1A3305] text-white hover:bg-[#1A3305]/90">
                                    Dashboard
                                </Button>
                            </Link>
                            <div className="w-8 h-8 rounded-full bg-[#1A3305] flex items-center justify-center text-white">
                                <User className="w-4 h-4" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="outline" className="rounded-full border-black/10 font-bold bg-white hover:bg-white/50">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="rounded-full font-bold bg-[#1A3305] text-white hover:bg-[#1A3305]/90 shadow-lg shadow-[#1A3305]/20">
                                    It's Free Try Now!
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

