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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Schedule New Interview</DialogTitle>
                        <DialogDescription>
                            Create a new interview. The candidate will receive a confirmation email.
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
                                placeholder="Interview notes..."
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
