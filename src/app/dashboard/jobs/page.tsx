'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Plus,
    Briefcase,
    Users,
    ChevronRight,
    Loader2,
    X
} from 'lucide-react';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    description: string | null;
    requirements: string[];
    level: string | null;
    department: string | null;
    isActive: boolean;
    candidateCount: number;
    createdAt: string;
}

export default function JobsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        requirements: '',
        level: 'mid',
        department: '',
    });

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const res = await fetch('/api/jobs');
            if (!res.ok) throw new Error('Failed to fetch jobs');
            return res.json();
        },
    });

    const createMutation = useMutation({
        mutationFn: async (jobData: typeof newJob) => {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...jobData,
                    requirements: jobData.requirements.split(',').map(r => r.trim()).filter(Boolean),
                }),
            });
            if (!res.ok) throw new Error('Failed to create job');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setShowCreateModal(false);
            setNewJob({ title: '', description: '', requirements: '', level: 'mid', department: '' });
        },
    });

    const jobs: Job[] = data?.jobs || [];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage job openings and review candidates
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#1A3305] hover:bg-[#1A3305]/90"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                </Button>
            </div>

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A3305]" />
                </div>
            ) : jobs.length === 0 ? (
                <Card className="p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
                    <p className="text-muted-foreground mt-1">
                        Create your first job posting to start receiving candidates
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 bg-[#1A3305] hover:bg-[#1A3305]/90"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Job
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#1A3305]">
                                            {job.title}
                                        </h3>
                                        {job.level && (
                                            <span className="inline-block mt-1 text-xs px-2 py-1 bg-[#1A3305]/10 text-[#1A3305] rounded-full">
                                                {job.level}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1A3305]" />
                                </div>

                                {job.description && (
                                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                        {job.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{job.candidateCount} candidates</span>
                                    </div>
                                    {job.department && (
                                        <span className="text-sm text-muted-foreground">
                                            {job.department}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Job Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Create New Job</h2>
                            <button onClick={() => setShowCreateModal(false)}>
                                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Job Title *</label>
                                <Input
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                    placeholder="Job description..."
                                    className="w-full px-3 py-2 border rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#1A3305]"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Requirements (comma separated)</label>
                                <Input
                                    value={newJob.requirements}
                                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                                    placeholder="React, TypeScript, Node.js, 3+ years experience"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Level</label>
                                    <select
                                        value={newJob.level}
                                        onChange={(e) => setNewJob({ ...newJob, level: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3305]"
                                    >
                                        <option value="junior">Junior</option>
                                        <option value="mid">Mid-Level</option>
                                        <option value="senior">Senior</option>
                                        <option value="lead">Lead/Principal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Department</label>
                                    <Input
                                        value={newJob.department}
                                        onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                                        placeholder="Engineering"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => createMutation.mutate(newJob)}
                                disabled={!newJob.title || createMutation.isPending}
                                className="bg-[#1A3305] hover:bg-[#1A3305]/90"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Create Job'
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
