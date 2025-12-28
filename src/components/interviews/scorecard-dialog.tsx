'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ScorecardDialogProps {
    interviewId: string;
    children: React.ReactNode;
    existingScorecard?: Scorecard | null;
}

interface Scorecard {
    technicalScore?: number;
    communicationScore?: number;
    cultureFitScore?: number;
    problemSolvingScore?: number;
    notes?: string;
}

const scoreLabels = ['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

function ScoreSelector({
    label,
    value,
    onChange
}: {
    label: string;
    value?: number;
    onChange: (val: number) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                    <button
                        key={score}
                        type="button"
                        onClick={() => onChange(score)}
                        className={`flex-1 py-2 px-3 rounded-md border text-sm transition-colors ${value === score
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent border-input'
                            }`}
                    >
                        {score}
                    </button>
                ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
                {value ? scoreLabels[value - 1] : 'Not rated'}
            </p>
        </div>
    );
}

export function ScorecardDialog({ interviewId, children, existingScorecard }: ScorecardDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scorecard, setScorecard] = useState<Scorecard>({});
    const queryClient = useQueryClient();

    // Load existing scorecard from prop or fetch
    useEffect(() => {
        if (open) {
            if (existingScorecard) {
                setScorecard({
                    technicalScore: existingScorecard.technicalScore,
                    communicationScore: existingScorecard.communicationScore,
                    cultureFitScore: existingScorecard.cultureFitScore,
                    problemSolvingScore: existingScorecard.problemSolvingScore,
                    notes: existingScorecard.notes,
                });
            } else {
                fetch(`/api/interviews/${interviewId}/scorecard`)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data) {
                            setScorecard({
                                technicalScore: data.technicalScore,
                                communicationScore: data.communicationScore,
                                cultureFitScore: data.cultureFitScore,
                                problemSolvingScore: data.problemSolvingScore,
                                notes: data.notes,
                            });
                        }
                    })
                    .catch(() => { });
            }
        }
    }, [open, interviewId, existingScorecard]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await fetch(`/api/interviews/${interviewId}/scorecard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scorecard),
            });
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['interviews'] });
        } finally {
            setLoading(false);
        }
    };

    const scores = [
        scorecard.technicalScore,
        scorecard.communicationScore,
        scorecard.cultureFitScore,
        scorecard.problemSolvingScore,
    ].filter((s): s is number => s !== undefined && s !== null);

    const averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Interview Scorecard</DialogTitle>
                    <DialogDescription>
                        Rate the candidate's performance across different areas.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <ScoreSelector
                        label="Technical Skills"
                        value={scorecard.technicalScore}
                        onChange={(val) => setScorecard(s => ({ ...s, technicalScore: val }))}
                    />

                    <ScoreSelector
                        label="Communication"
                        value={scorecard.communicationScore}
                        onChange={(val) => setScorecard(s => ({ ...s, communicationScore: val }))}
                    />

                    <ScoreSelector
                        label="Culture Fit"
                        value={scorecard.cultureFitScore}
                        onChange={(val) => setScorecard(s => ({ ...s, cultureFitScore: val }))}
                    />

                    <ScoreSelector
                        label="Problem Solving"
                        value={scorecard.problemSolvingScore}
                        onChange={(val) => setScorecard(s => ({ ...s, problemSolvingScore: val }))}
                    />

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <textarea
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Additional observations..."
                            value={scorecard.notes || ''}
                            onChange={(e) => setScorecard(s => ({ ...s, notes: e.target.value }))}
                        />
                    </div>

                    {averageScore > 0 && (
                        <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">out of 5</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Scorecard'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
