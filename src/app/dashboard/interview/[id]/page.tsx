'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/interviews/status-badge';
import { ScorecardDialog } from '@/components/interviews/scorecard-dialog';
import {
    ArrowLeft,
    Calendar,
    Mail,
    User,
    Briefcase,
    FileText,
    Brain,
    CheckCircle2,
    Loader2,
    Sparkles,
    ClipboardList
} from 'lucide-react';

// Types
type Interview = {
    id: string;
    candidateName: string;
    candidateEmail: string;
    interviewerEmail: string;
    scheduledAt: string;
    status: string;
    meetingLink?: string;
    notes?: string;
    jobRole?: string;
    jobLevel?: string;
    evaluation?: {
        score: number;
        summary: string;
        strengths: string[];
        risks: string[];
    };
};

type Question = {
    question: string;
    category: string;
    difficulty: string;
};

type InterviewQuestions = {
    id: string;
    questions: Question[];
};

type Scorecard = {
    technicalScore?: number;
    communicationScore?: number;
    cultureFitScore?: number;
    problemSolvingScore?: number;
    notes?: string;
};

// Fetchers
const fetchInterview = async (id: string): Promise<Interview> => {
    const res = await fetch(`/api/interviews/${id}`);
    if (!res.ok) throw new Error('Failed to fetch interview');
    return res.json();
};

const fetchQuestions = async (id: string): Promise<InterviewQuestions | null> => {
    const res = await fetch(`/api/interviews/${id}/questions`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
};

const fetchScorecard = async (id: string): Promise<Scorecard | null> => {
    const res = await fetch(`/api/interviews/${id}/scorecard`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch scorecard');
    return res.json();
};

export default function InterviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id as string;

    const { data: interview, isLoading, refetch: refetchInterview } = useQuery({
        queryKey: ['interview', id],
        queryFn: () => fetchInterview(id),
        // Poll every 2 seconds when waiting for evaluation to complete
        refetchInterval: (query) => {
            const data = query.state.data;
            // Poll while evaluation is pending or if status is EVALUATION_PENDING
            if (data?.status === 'EVALUATION_PENDING') return 2000;
            return false;
        },
    });

    const { data: questions } = useQuery({
        queryKey: ['questions', id],
        queryFn: () => fetchQuestions(id),
    });

    const { data: scorecard } = useQuery({
        queryKey: ['scorecard', id],
        queryFn: () => fetchScorecard(id),
    });

    // Mutations
    const generateQuestionsMutation = useMutation({
        mutationFn: async () => {
            if (!interview?.jobRole || !interview?.jobLevel) {
                throw new Error('Job role and level required');
            }
            const res = await fetch(`/api/interviews/${id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobRole: interview.jobRole,
                    jobLevel: interview.jobLevel,
                }),
            });
            if (!res.ok) throw new Error('Failed to generate questions');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions', id] }),
    });

    const markCompleteMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/interviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' }),
            });
            if (!res.ok) throw new Error('Failed to mark complete');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview', id] }),
    });

    const triggerEvaluationMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/interviews/${id}/evaluate`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to trigger evaluation');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview', id] }),
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <p className="text-muted-foreground">Interview not found</p>
                <Link href="/dashboard">
                    <Button variant="link" className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const avgScore = scorecard ? (
        ((scorecard.technicalScore || 0) + (scorecard.communicationScore || 0) +
            (scorecard.cultureFitScore || 0) + (scorecard.problemSolvingScore || 0)) / 4
    ).toFixed(1) : null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold font-heading">{interview.candidateName}</h1>
                            <StatusBadge status={interview.status as any} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" /> {interview.candidateEmail}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> {format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}
                            </span>
                            {interview.jobRole && (
                                <span className="flex items-center gap-1">
                                    <Briefcase className="w-4 h-4" /> {interview.jobRole} ({interview.jobLevel})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {interview.status === 'SCHEDULED' && (
                            <Button
                                onClick={() => markCompleteMutation.mutate()}
                                disabled={markCompleteMutation.isPending}
                                className="bg-[#1A3305] hover:bg-[#1A3305]/90"
                            >
                                {markCompleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Mark Complete
                            </Button>
                        )}
                        {interview.status === 'COMPLETED' && (
                            <Button
                                onClick={() => triggerEvaluationMutation.mutate()}
                                disabled={triggerEvaluationMutation.isPending}
                                variant="outline"
                            >
                                {triggerEvaluationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                                Trigger AI Evaluation
                            </Button>
                        )}
                        <ScorecardDialog interviewId={id} existingScorecard={scorecard}>
                            <Button variant="outline">
                                <ClipboardList className="w-4 h-4 mr-2" />
                                {scorecard ? 'Edit Scorecard' : 'Add Scorecard'}
                            </Button>
                        </ScorecardDialog>
                    </div>
                </div>

                {interview.notes && (
                    <div className="mt-6 p-4 bg-[#FAFAF9] rounded-xl">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5" />
                            {interview.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* Scorecard Summary */}
            {scorecard && (
                <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                    <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" /> Scorecard
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Technical', value: scorecard.technicalScore },
                            { label: 'Communication', value: scorecard.communicationScore },
                            { label: 'Culture Fit', value: scorecard.cultureFitScore },
                            { label: 'Problem Solving', value: scorecard.problemSolvingScore },
                            { label: 'Average', value: avgScore, highlight: true },
                        ].map((item) => (
                            <div key={item.label} className={`p-4 rounded-xl text-center ${item.highlight ? 'bg-[#ECFDF5]' : 'bg-[#FAFAF9]'}`}>
                                <p className="text-2xl font-bold">{item.value || '-'}/5</p>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                            </div>
                        ))}
                    </div>
                    {scorecard.notes && (
                        <p className="mt-4 text-sm text-muted-foreground">{scorecard.notes}</p>
                    )}
                </div>
            )}

            {/* AI Questions */}
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Interview Questions
                    </h2>
                    {!questions && interview.jobRole && interview.jobLevel && (
                        <Button
                            onClick={() => generateQuestionsMutation.mutate()}
                            disabled={generateQuestionsMutation.isPending}
                            size="sm"
                            className="bg-[#1A3305]"
                        >
                            {generateQuestionsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                            Generate Questions
                        </Button>
                    )}
                </div>

                {questions ? (
                    <div className="space-y-4">
                        {questions.questions.map((q, i) => (
                            <div key={i} className="p-4 bg-[#FAFAF9] rounded-xl">
                                <div className="flex gap-2 mb-2">
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#1A3305]">{q.category}</span>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">{q.difficulty}</span>
                                </div>
                                <p className="font-medium">{q.question}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        {interview.jobRole && interview.jobLevel
                            ? 'No questions generated yet. Click "Generate Questions" to create AI-powered interview questions.'
                            : 'Set job role and level when creating the interview to enable AI question generation.'}
                    </p>
                )}
            </div>

            {/* AI Evaluation */}
            {interview.evaluation && (
                <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm">
                    <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" /> AI Evaluation
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <p className="text-muted-foreground mb-4">{interview.evaluation.summary}</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2 text-green-700">Strengths</h4>
                                    <ul className="space-y-1">
                                        {interview.evaluation.strengths.map((s, i) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2 text-red-700">Risks</h4>
                                    <ul className="space-y-1">
                                        {interview.evaluation.risks.map((r, i) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <span className="w-4 h-4 text-red-500 mt-0.5 shrink-0">⚠</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-center p-6 bg-[#ECFDF5] rounded-2xl">
                                <p className="text-5xl font-bold text-[#1A3305]">{interview.evaluation.score}</p>
                                <p className="text-sm text-muted-foreground mt-1">AI Score / 10</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
