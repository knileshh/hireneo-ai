'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Interview } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/interviews/status-badge';
import { CreateInterviewDialog } from '@/components/interviews/create-interview-dialog';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const res = await fetch('/api/interviews');
      if (!res.ok) throw new Error('Failed to fetch interviews');
      return res.json() as Promise<{ data: Interview[]; pagination: any }>;
    },
    refetchInterval: 5000,
  });

  const interviews = interviewsData?.data || [];

  const handleMarkCompleted = async (id: string) => {
    setLoadingAction(`complete-${id}`);
    try {
      await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunEvaluation = async (id: string) => {
    setLoadingAction(`eval-${id}`);
    try {
      await fetch(`/api/interviews/${id}/evaluate`, {
        method: 'POST',
      });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your hiring pipeline
            </p>
          </div>
          <CreateInterviewDialog>
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New Interview
            </Button>
          </CreateInterviewDialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Interviews</CardDescription>
              <CardTitle className="text-3xl">{interviews.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scheduled</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {interviews.filter((i) => i.status === 'SCHEDULED').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {interviews.filter((i) => i.status === 'COMPLETED').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Evaluated</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {interviews.filter((i) => i.status === 'EVALUATED').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Interviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
            <CardDescription>
              Manage and track all scheduled interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No interviews scheduled yet
                </p>
                <CreateInterviewDialog>
                  <Button>Schedule Your First Interview</Button>
                </CreateInterviewDialog>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview: Interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.candidateEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={interview.status as any} />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {interview.status === 'SCHEDULED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkCompleted(interview.id)}
                              disabled={loadingAction === `complete-${interview.id}`}
                            >
                              {loadingAction === `complete-${interview.id}`
                                ? 'Updating...'
                                : 'Mark Completed'}
                            </Button>
                          )}
                          {interview.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              onClick={() => handleRunEvaluation(interview.id)}
                              disabled={loadingAction === `eval-${interview.id}`}
                            >
                              {loadingAction === `eval-${interview.id}`
                                ? 'Starting...'
                                : 'Run Evaluation'}
                            </Button>
                          )}
                          {interview.status === 'EVALUATION_PENDING' && (
                            <span className="text-sm text-muted-foreground">
                              Processing...
                            </span>
                          )}
                          {interview.status === 'EVALUATED' && (
                            <Button size="sm" variant="ghost">
                              View Results
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Polling Status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates enabled • Refreshes every 5 seconds
        </div>
      </div>
    </div>
  );
}
