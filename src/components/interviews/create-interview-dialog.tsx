'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateInterviewDialogProps {
    children: React.ReactNode;
}

export function CreateInterviewDialog({ children }: CreateInterviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            candidateName: formData.get('candidateName') as string,
            candidateEmail: formData.get('candidateEmail') as string,
            interviewerEmail: formData.get('interviewerEmail') as string,
            scheduledAt: new Date(formData.get('scheduledAt') as string).toISOString(),
            jobRole: formData.get('jobRole') as string || undefined,
            jobLevel: formData.get('jobLevel') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        };

        try {
            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setOpen(false);
                queryClient.invalidateQueries({ queryKey: ['interviews'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Schedule New Interview</DialogTitle>
                        <DialogDescription>
                            Create a new interview. AI will generate tailored questions based on the job role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="candidateName">Candidate Name</Label>
                            <Input
                                id="candidateName"
                                name="candidateName"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="candidateEmail">Candidate Email</Label>
                            <Input
                                id="candidateEmail"
                                name="candidateEmail"
                                type="email"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="interviewerEmail">Interviewer Email</Label>
                            <Input
                                id="interviewerEmail"
                                name="interviewerEmail"
                                type="email"
                                placeholder="interviewer@company.com"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="jobRole">Job Role</Label>
                                <Input
                                    id="jobRole"
                                    name="jobRole"
                                    placeholder="Frontend Developer"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="jobLevel">Level</Label>
                                <select
                                    id="jobLevel"
                                    name="jobLevel"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Select level...</option>
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid-level</option>
                                    <option value="senior">Senior</option>
                                    <option value="lead">Lead</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                            <Input
                                id="scheduledAt"
                                name="scheduledAt"
                                type="datetime-local"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                name="notes"
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Interview'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
