'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NewsletterFormProps {
    variant?: 'default' | 'inverted';
    className?: string;
}

export function NewsletterForm({ variant = 'default', className = '' }: NewsletterFormProps) {
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

    // Styles based on variant
    const isDefault = variant === 'default';

    // Default: Dark Text, Transparent Input (for Light Backgrounds)
    // Inverted: Light Text, White Input (for Dark Backgrounds)

    const inputClasses = isDefault
        ? "flex-1 px-4 h-12 bg-transparent border-b-2 border-dashed border-black/30 focus:border-[#1A3305] outline-none transition-colors w-full disabled:opacity-50 placeholder:text-muted-foreground text-foreground"
        : "flex-1 h-12 rounded-full border-0 bg-white/10 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/50 outline-none backdrop-blur-sm w-full disabled:opacity-50";

    const buttonClasses = isDefault
        ? `w-full sm:w-auto h-12 px-8 font-bold rounded-full transition-all ${status === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#1A3305] hover:bg-[#1A3305]/90 text-white'}`
        : `w-full sm:w-auto h-12 px-8 font-bold rounded-full transition-all ${status === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' : status === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-[#1A3305] hover:bg-gray-100'}`;

    return (
        <div className={className}>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    required
                    disabled={status === 'loading' || status === 'success'}
                />
                <Button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className={buttonClasses}
                >
                    {status === 'loading' ? 'wait...' : status === 'success' ? 'Subscribed!' : status === 'error' ? 'Retry' : 'Subscribe'}
                </Button>
            </form>
            {status === 'success' && (
                <p className={`text-sm mt-2 ${!isDefault ? 'text-green-300' : 'text-green-600'}`}>✨ Check your inbox for a welcome email!</p>
            )}
            {status === 'error' && (
                <p className={`text-sm mt-2 ${!isDefault ? 'text-red-300' : 'text-red-500'}`}>Something went wrong. Please try again.</p>
            )}
        </div>
    );
}
