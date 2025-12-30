'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, AlertCircle, Building2 } from 'lucide-react';

type UserRole = 'candidate' | 'recruiter';

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('candidate');
    const [company, setCompany] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                    company: role === 'recruiter' ? company : null,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            // Provide user-friendly error messages
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                setError('This email is already registered. Please sign in instead, or use a different email.');
            } else {
                setError(error.message);
            }
            setIsLoading(false);
            return;
        }

        // Send welcome email
        try {
            await fetch('/api/email/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, role }),
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't block signup if email fails
        }

        setSuccess(true);
        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">✉️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                    <p className="text-muted-foreground">
                        We've sent you a confirmation link at <strong>{email}</strong>.
                        Click the link to activate your account.
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-6"
                    >
                        <Link href="/login">Back to login</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4 py-6">
            <Card className="w-full max-w-md p-6">
                <div className="text-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="HireNeo AI"
                        width={48}
                        height={48}
                        className="mx-auto mb-3 rounded-xl"
                    />
                    <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Join HireNeo AI to streamline your hiring
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => setRole('candidate')}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${role === 'candidate'
                            ? 'border-[#1A3305] bg-[#1A3305]/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <User className="w-4 h-4 mb-1" />
                        <p className="text-sm font-medium">Candidate</p>
                        <p className="text-xs text-muted-foreground">Find your dream job</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('recruiter')}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${role === 'recruiter'
                            ? 'border-[#1A3305] bg-[#1A3305]/5'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Building2 className="w-4 h-4 mb-1" />
                        <p className="text-sm font-medium">Recruiter</p>
                        <p className="text-xs text-muted-foreground">Hire top talent</p>
                    </button>
                </div>

                <form onSubmit={handleSignup} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {role === 'recruiter' && (
                        <div>
                            <label className="text-sm font-medium">Company Name</label>
                            <div className="relative mt-1">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Acme Inc."
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10"
                                minLength={6}
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            At least 6 characters
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#1A3305] font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </Card>
        </div>
    );
}
