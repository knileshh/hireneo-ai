'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateInterviewDialog } from '@/components/interviews/create-interview-dialog';
import { StatusBadge } from '@/components/interviews/status-badge';
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Brain,
  Trash2,
  Play,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
type Interview = {
  id: string;
  candidateName: string;
  jobRole?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'EVALUATED' | 'EVALUATION_PENDING';
  scheduledAt: string;
  averageScore?: number;
};

// Fetcher
const fetchInterviews = async () => {
  const res = await fetch('/api/interviews');
  if (!res.ok) throw new Error('Failed to fetch interviews');
  const response = await res.json();
  return response.data as Interview[];
};

// Dashboard Metric Card
const DashboardMetric = ({ label, value, icon: Icon, colorClass }: any) => (
  <div className={`p-6 rounded-3xl border border-black/5 flex flex-col justify-between h-32 ${colorClass}`}>
    <div className="flex justify-between items-start">
      <span className="font-medium text-black/60">{label}</span>
      <div className="bg-white/50 p-2 rounded-xl">
        <Icon className="w-5 h-5 text-black/70" />
      </div>
    </div>
    <span className="font-heading font-bold text-4xl tracking-tight">{value}</span>
  </div>
);

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  });

  // Mutations for quick actions
  const markCompleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  const triggerEvaluationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interviews/${id}/evaluate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  // Filter interviews
  const filteredInterviews = interviews?.filter(interview => {
    const matchesSearch = searchQuery === '' ||
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interview.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Today's interviews
  const todaysInterviews = interviews?.filter(i =>
    i.status === 'SCHEDULED' && isToday(new Date(i.scheduledAt))
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // Calculate metrics
  const total = interviews?.length || 0;
  const completed = interviews?.filter(i => i.status === 'COMPLETED' || i.status === 'EVALUATED').length || 0;
  const scheduled = interviews?.filter(i => i.status === 'SCHEDULED').length || 0;
  const avgScore = interviews && interviews.length > 0
    ? interviews.reduce((acc, curr) => acc + (curr.averageScore || 0), 0) / (interviews.filter(i => i.averageScore).length || 1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-dashed border-black/10 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Here is what's happening today.
          </p>
        </div>
        <CreateInterviewDialog>
          <Button size="lg" className="rounded-xl bg-[#1A3305] text-white hover:bg-[#1A3305]/90 shadow-lg shadow-[#1A3305]/10 font-bold px-6">
            <span className="mr-2 text-xl">+</span> Schedule Interview
          </Button>
        </CreateInterviewDialog>
      </div>

      {/* Today's Agenda - Only show if there are interviews today */}
      {todaysInterviews && todaysInterviews.length > 0 && (
        <div className="bg-[#FEF08A]/30 rounded-3xl border border-[#FEF08A] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#1A3305]" />
            <h2 className="font-heading font-bold text-lg">Today's Agenda</h2>
            <span className="bg-[#1A3305] text-white text-xs px-2 py-0.5 rounded-full">{todaysInterviews.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todaysInterviews.slice(0, 3).map(interview => (
              <Link key={interview.id} href={`/dashboard/interview/${interview.id}`}>
                <div className="bg-white rounded-xl p-4 border border-black/5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{interview.candidateName}</span>
                    <span className="text-xs font-medium text-[#1A3305] bg-[#ECFDF5] px-2 py-0.5 rounded">
                      {format(new Date(interview.scheduledAt), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{interview.jobRole || 'Interview'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bento Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetric
          label="Total Candidates"
          value={total}
          icon={Users}
          colorClass="bg-[#FAFAF9]"
        />
        <DashboardMetric
          label="Upcoming"
          value={scheduled}
          icon={Calendar}
          colorClass="bg-[#FEF08A]"
        />
        <DashboardMetric
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          colorClass="bg-[#ECFDF5]"
        />
        <DashboardMetric
          label="Avg Score"
          value={avgScore.toFixed(1)}
          icon={TrendingUp}
          colorClass="bg-[#E5E7EB]"
        />
      </div>

      {/* Main Content Area: Recent Interviews Grid */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-[#FAFAF9]/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-heading">All Interviews</h2>
              <p className="text-sm text-muted-foreground">Manage your hiring pipeline</p>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px] rounded-xl border-black/10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-black/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="EVALUATION_PENDING">Evaluating</SelectItem>
                  <SelectItem value="EVALUATED">Evaluated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading pipeline...</div>
          ) : filteredInterviews?.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">📝</div>
              <h3 className="font-heading font-bold text-lg mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matches found' : 'No interviews yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by scheduling your first AI-powered interview.'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <CreateInterviewDialog>
                  <Button className="rounded-full bg-[#1A3305]">Schedule Now</Button>
                </CreateInterviewDialog>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-4 pl-4">Candidate</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Scheduled</th>
                    <th className="pb-4">Score</th>
                    <th className="pb-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredInterviews?.map((interview) => (
                    <tr key={interview.id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                            {interview.candidateName.charAt(0)}
                          </div>
                          <span className="font-bold">{interview.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-gray-600">{interview.jobRole || 'Software Engineer'}</td>
                      <td className="py-4">
                        <StatusBadge status={interview.status} />
                      </td>
                      <td className="py-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(new Date(interview.scheduledAt), 'MMM d, h:mm a')}
                        </div>
                      </td>
                      <td className="py-4">
                        {interview.averageScore ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-[#ECFDF5] text-[#065F46]">
                            {interview.averageScore.toFixed(1)}/5.0
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/interview/${interview.id}`}>
                            <Button size="sm" variant="outline" className="rounded-full h-8 px-4 bg-white hover:bg-[#FEF08A] hover:border-[#FEF08A] hover:text-black border-gray-200">
                              View
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {interview.status === 'SCHEDULED' && (
                                <DropdownMenuItem
                                  onClick={() => markCompleteMutation.mutate(interview.id)}
                                  disabled={markCompleteMutation.isPending}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              {interview.status === 'COMPLETED' && (
                                <DropdownMenuItem
                                  onClick={() => triggerEvaluationMutation.mutate(interview.id)}
                                  disabled={triggerEvaluationMutation.isPending}
                                >
                                  <Brain className="w-4 h-4 mr-2" />
                                  Trigger Evaluation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this interview?')) {
                                    deleteInterviewMutation.mutate(interview.id);
                                  }
                                }}
                                disabled={deleteInterviewMutation.isPending}
                                className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
