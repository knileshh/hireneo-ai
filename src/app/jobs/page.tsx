'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Briefcase,
    MapPin,
    Clock,
    Search,
    Loader2,
    Building2,
    Users,
    ArrowRight,
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
    candidateCount: number;
}

export default function PublicJobsPage() {
    const [search, setSearch] = useState('');
    const [user, setUser] = useState<{ role?: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser({ role: data.user.user_metadata?.role });
            }
        });
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['public-jobs'],
        queryFn: async () => {
            const res = await fetch('/api/jobs');
            if (!res.ok) throw new Error('Failed to fetch jobs');
            return res.json();
        },
    });

    const jobs: Job[] = data?.jobs || [];
    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="HireNeo AI" width={32} height={32} className="rounded-lg" />
                        <span className="font-bold text-lg text-[#1A3305]">HireNeo AI</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href={user.role === 'recruiter' ? '/dashboard' : '/candidate'}>
                                <Button className="bg-[#1A3305] hover:bg-[#1A3305]/90">
                                    {user.role === 'recruiter' ? 'Dashboard' : 'My Applications'}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="bg-[#1A3305] hover:bg-[#1A3305]/90">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gradient-to-br from-[#1A3305] to-[#2d5a0a] text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
                    <p className="text-lg text-white/80 mb-8">
                        Discover opportunities and let AI match you with the perfect role
                    </p>
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search jobs by title or department..."
                            className="pl-12 h-12 text-black bg-white border-0"
                        />
                    </div>
                </div>
            </div>

            {/* Job Listings */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        {filteredJobs.length} Open Position{filteredJobs.length !== 1 ? 's' : ''}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1A3305]" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="font-medium text-gray-900 mb-1">No jobs found</h3>
                        <p className="text-sm text-muted-foreground">
                            {search ? 'Try a different search term' : 'Check back soon for new opportunities'}
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredJobs.map((job) => (
                            <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{job.title}</h3>
                                            {job.level && (
                                                <span className="px-2 py-0.5 bg-[#1A3305]/10 text-[#1A3305] text-xs rounded-full">
                                                    {job.level}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            {job.department && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {job.department}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.candidateCount} applicants
                                            </span>
                                        </div>

                                        {job.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {job.description}
                                            </p>
                                        )}

                                        {job.requirements && job.requirements.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {job.requirements.slice(0, 5).map((req, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {req}
                                                    </span>
                                                ))}
                                                {job.requirements.length > 5 && (
                                                    <span className="px-2 py-1 text-gray-500 text-xs">
                                                        +{job.requirements.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/jobs/${job.id}`}>
                                        <Button className="bg-[#1A3305] hover:bg-[#1A3305]/90">
                                            Apply Now
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
