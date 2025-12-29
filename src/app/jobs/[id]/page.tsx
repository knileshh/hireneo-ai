'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Clock,
    Users,
    Loader2,
    CheckCircle,
    Upload,
    FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    description: string | null;
    requirements: string[];
    level: string | null;
    department: string | null;
    createdAt: string;
}

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [user, setUser] = useState<{ id: string; email: string; full_name: string } | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email || '',
                    full_name: data.user.user_metadata?.full_name || '',
                });
            }
        });
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job');
            return res.json();
        },
    });

    const applyMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/jobs/${jobId}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    name: user?.full_name,
                    email: user?.email,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to apply');
            }
            return res.json();
        },
        onSuccess: () => {
            setApplied(true);
        },
    });

    const job: Job | null = data?.job || null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A3305]" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Job not found</h2>
                    <Link href="/jobs">
                        <Button>Back to Jobs</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="HireNeo AI" width={32} height={32} className="rounded-lg" />
                        <span className="font-bold text-lg text-[#1A3305]">HireNeo AI</span>
                    </Link>
                    {user ? (
                        <Link href="/candidate">
                            <Button variant="outline">My Applications</Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button>Sign in to Apply</Button>
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to jobs
                </Link>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Job Details */}
                    <div className="md:col-span-2">
                        <Card className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-2xl font-bold">{job.title}</h1>
                                    {job.level && (
                                        <span className="px-3 py-1 bg-[#1A3305]/10 text-[#1A3305] text-sm rounded-full">
                                            {job.level}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {job.department && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4" />
                                            {job.department}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {job.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">About the Role</h3>
                                    <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
                                </div>
                            )}

                            {job.requirements && job.requirements.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Requirements</h3>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                                <CheckCircle className="w-4 h-4 text-[#1A3305] mt-0.5 flex-shrink-0" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Apply Section */}
                    <div>
                        <Card className="p-6 sticky top-24">
                            {applied ? (
                                <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold mb-1">Application Submitted!</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        We'll notify you when there's an update
                                    </p>
                                    <Link href="/candidate">
                                        <Button variant="outline" className="w-full">
                                            View My Applications
                                        </Button>
                                    </Link>
                                </div>
                            ) : user ? (
                                <>
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Apply for this position
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Your Resume</label>
                                            <textarea
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                placeholder="Paste your resume or describe your experience..."
                                                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3305] resize-none h-32"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                AI will analyze your resume to match with job requirements
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => applyMutation.mutate()}
                                            disabled={!resumeText.trim() || applyMutation.isPending}
                                            className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90"
                                        >
                                            {applyMutation.isPending ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </Button>

                                        {applyMutation.isError && (
                                            <p className="text-sm text-red-600 text-center">
                                                {applyMutation.error.message}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <Briefcase className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                    <h3 className="font-semibold mb-1">Sign in to Apply</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create an account to apply for this position
                                    </p>
                                    <Link href={`/login?redirectTo=/jobs/${jobId}`}>
                                        <Button className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button variant="outline" className="w-full mt-2">
                                            Create Account
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
