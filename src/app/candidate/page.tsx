'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    User,
    Briefcase,
    FileText,
    ClipboardCheck,
    LogOut,
    Loader2,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

interface Application {
    id: string;
    jobId: string;
    jobTitle: string;
    company: string;
    status: 'NEW' | 'PENDING' | 'SHORTLISTED' | 'INVITED' | 'COMPLETED' | 'REJECTED';
    appliedAt: string;
    matchScore?: number;
    interviewId?: string;
    invitedAt?: string;
}

export default function CandidateDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data, error }) => {
            if (error || !data.user) {
                router.push('/login');
                return;
            }

            // Check if user is a candidate
            const role = data.user.user_metadata?.role;
            if (role === 'recruiter') {
                router.push('/dashboard');
                return;
            }

            setUser({
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || 'Candidate',
                role: role || 'candidate',
            });
            setLoading(false);

            // Fetch applications from API
            fetch('/api/candidate/applications')
                .then(res => res.json())
                .then(data => {
                    if (data.applications) {
                        setApplications(data.applications);
                    }
                })
                .catch(err => console.error('Failed to fetch applications:', err));
        });
    }, [router]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A3305]" />
            </div>
        );
    }

    const getStatusBadge = (status: Application['status']) => {
        const styles = {
            NEW: 'bg-yellow-100 text-yellow-700',
            PENDING: 'bg-gray-100 text-gray-600',
            SHORTLISTED: 'bg-purple-100 text-purple-700',
            INVITED: 'bg-blue-100 text-blue-700',
            COMPLETED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
        };
        const labels = {
            NEW: 'Applied',
            PENDING: 'Under Review',
            SHORTLISTED: 'Shortlisted',
            INVITED: 'Assessment Invited',
            COMPLETED: 'Completed',
            REJECTED: 'Not Selected',
        };
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="HireNeo AI" width={32} height={32} className="rounded-lg" />
                        <span className="font-bold text-lg text-[#1A3305]">HireNeo AI</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your job applications and complete assessments
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{applications.length}</p>
                                <p className="text-sm text-muted-foreground">Applications</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <ClipboardCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {applications.filter(a => a.status === 'INVITED').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Pending Assessments</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {applications.filter(a => a.status === 'COMPLETED').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {applications.filter(a => a.status === 'SHORTLISTED').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Shortlisted</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link href="/jobs">
                        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#1A3305]/10 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-[#1A3305]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Browse Jobs</h3>
                                        <p className="text-sm text-muted-foreground">Find your next opportunity</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1A3305] transition-colors" />
                            </div>
                        </Card>
                    </Link>
                    <Link href="/candidate/profile">
                        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#1A3305]/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-[#1A3305]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">My Profile</h3>
                                        <p className="text-sm text-muted-foreground">Update your resume & details</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1A3305] transition-colors" />
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Applications */}
                <Card>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            My Applications
                        </h2>
                    </div>

                    {applications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="font-medium text-gray-900 mb-1">No applications yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Start exploring jobs and submit your first application
                            </p>
                            <Link href="/jobs">
                                <Button className="bg-[#1A3305] hover:bg-[#1A3305]/90">
                                    Browse Jobs
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {applications.map((app) => (
                                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <h3 className="font-medium">{app.jobTitle}</h3>
                                        <p className="text-sm text-muted-foreground">{app.company}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {app.matchScore && (
                                            <span className="text-sm text-muted-foreground">
                                                Match: {app.matchScore}%
                                            </span>
                                        )}
                                        {getStatusBadge(app.status)}
                                        {app.status === 'INVITED' && (
                                            <Button size="sm" className="bg-[#1A3305] hover:bg-[#1A3305]/90">
                                                Start Assessment
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}
