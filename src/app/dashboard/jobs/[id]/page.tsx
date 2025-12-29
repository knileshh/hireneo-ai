'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Upload,
    Users,
    Star,
    Mail,
    Loader2,
    ChevronDown,
    ChevronUp,
    Check,
    AlertCircle,
    Trophy,
    Sparkles,
    FileText,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    matchScore: number | null;
    matchAnalysis: {
        strengths: string[];
        gaps: string[];
        recommendation: string;
    } | null;
    resumeUrl: string | null;
    status: string;
    parsedResume: {
        summary: string;
        skills: string[];
        yearsOfExperience: number;
    } | null;
    createdAt: string;
}

interface Job {
    id: string;
    title: string;
    description: string | null;
    requirements: string[];
    level: string | null;
    department: string | null;
    candidates: Candidate[];
}

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.id as string;
    const queryClient = useQueryClient();

    const [resumeText, setResumeText] = useState('');
    const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to fetch job');
            return res.json();
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (text: string) => {
            const res = await fetch(`/api/jobs/${jobId}/candidates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: text }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to upload resume');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
            setResumeText('');
        },
    });

    const rankMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/jobs/${jobId}/candidates/rank`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to rank candidates');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        },
    });

    const shortlistMutation = useMutation({
        mutationFn: async (candidateId: string) => {
            const res = await fetch(`/api/candidates/${candidateId}/shortlist`, {
                method: 'POST',
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to shortlist');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        },
    });

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Read file as text
            const text = await file.text();
            await uploadMutation.mutateAsync(text);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [uploadMutation]);

    const job: Job | null = data?.job || null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A3305]" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold">Job not found</h2>
            </div>
        );
    }

    const candidates = job.candidates || [];
    const sortedCandidates = [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    const getScoreColor = (score: number | null) => {
        if (!score) return 'bg-gray-100 text-gray-600';
        if (score >= 80) return 'bg-green-100 text-green-700';
        if (score >= 60) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'INVITED':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">📧 Invited</span>;
            case 'SHORTLISTED':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">⭐ Shortlisted</span>;
            case 'COMPLETED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✅ Completed</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">New</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/jobs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Button>
                </Link>
            </div>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        {job.level && (
                            <span className="px-2 py-1 bg-[#1A3305]/10 text-[#1A3305] text-sm rounded-full">
                                {job.level}
                            </span>
                        )}
                        {job.department && (
                            <span className="text-muted-foreground">{job.department}</span>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {candidates.length} candidates
                        </span>
                    </div>
                </div>

                <Button
                    onClick={() => rankMutation.mutate()}
                    disabled={rankMutation.isPending || candidates.length === 0}
                    className="bg-[#1A3305] hover:bg-[#1A3305]/90"
                >
                    {rankMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Rank Candidates
                </Button>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
                <Card className="p-4 mb-6 bg-gray-50">
                    <h3 className="font-medium mb-2">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, i) => (
                            <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm">
                                {req}
                            </span>
                        ))}
                    </div>
                </Card>
            )}

            {/* Resume Upload */}
            <Card className="p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Add Candidate
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#1A3305] transition-colors">
                        <input
                            type="file"
                            accept=".txt,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="font-medium">Upload Resume</p>
                            <p className="text-sm text-muted-foreground">
                                Drop file or click to browse
                            </p>
                        </label>
                    </div>

                    {/* Paste Text */}
                    <div className="space-y-2">
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Or paste resume text here..."
                            className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3305] resize-none"
                        />
                        <Button
                            onClick={() => uploadMutation.mutate(resumeText)}
                            disabled={!resumeText.trim() || uploadMutation.isPending}
                            className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90"
                        >
                            {uploadMutation.isPending || isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Parsing with AI...
                                </>
                            ) : (
                                <>Parse & Score Resume</>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Candidates Table */}
            <Card>
                <div className="p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Candidates ({candidates.length})
                    </h3>
                </div>

                {candidates.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>No candidates yet. Upload resumes to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {sortedCandidates.map((candidate, index) => (
                            <div key={candidate.id} className="p-4 hover:bg-gray-50">
                                <div
                                    className="flex items-center gap-4 cursor-pointer"
                                    onClick={() => setExpandedCandidate(
                                        expandedCandidate === candidate.id ? null : candidate.id
                                    )}
                                >
                                    {/* Rank badge */}
                                    <div className="w-8 h-8 rounded-full bg-[#1A3305]/10 flex items-center justify-center">
                                        {index === 0 && candidate.matchScore ? (
                                            <Trophy className="w-4 h-4 text-[#1A3305]" />
                                        ) : (
                                            <span className="text-sm font-medium text-[#1A3305]">
                                                #{index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name & Email */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{candidate.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {candidate.email}
                                        </p>
                                    </div>

                                    {/* Match Score */}
                                    <div className={`px-3 py-1 rounded-full font-medium ${getScoreColor(candidate.matchScore)}`}>
                                        {candidate.matchScore ? `${candidate.matchScore}/100` : 'Not scored'}
                                    </div>

                                    {/* Status */}
                                    {getStatusBadge(candidate.status)}

                                    {/* View Resume */}
                                    {candidate.resumeUrl && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(candidate.resumeUrl!, '_blank');
                                            }}
                                            className="border-[#1A3305] text-[#1A3305] hover:bg-[#1A3305]/10"
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            View Resume
                                        </Button>
                                    )}

                                    {/* Actions */}
                                    {candidate.status === 'NEW' && (
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                shortlistMutation.mutate(candidate.id);
                                            }}
                                            disabled={shortlistMutation.isPending}
                                            className="bg-[#1A3305] hover:bg-[#1A3305]/90"
                                        >
                                            {shortlistMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Mail className="w-4 h-4 mr-1" />
                                                    Shortlist
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {/* Expand toggle */}
                                    {expandedCandidate === candidate.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {expandedCandidate === candidate.id && (
                                    <div className="mt-4 pl-12 grid md:grid-cols-2 gap-4">
                                        {/* Match Analysis */}
                                        {candidate.matchAnalysis && (
                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
                                                        <Check className="w-4 h-4" /> Strengths
                                                    </h4>
                                                    <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                                                        {candidate.matchAnalysis.strengths.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-amber-700 flex items-center gap-1">
                                                        <AlertCircle className="w-4 h-4" /> Gaps
                                                    </h4>
                                                    <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                                                        {candidate.matchAnalysis.gaps.map((g, i) => (
                                                            <li key={i}>{g}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {candidate.parsedResume && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Skills</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {candidate.parsedResume.skills?.slice(0, 10).map((skill, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                                {candidate.parsedResume.yearsOfExperience && (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {candidate.parsedResume.yearsOfExperience}+ years experience
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
