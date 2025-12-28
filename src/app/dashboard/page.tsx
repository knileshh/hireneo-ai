'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateInterviewDialog } from '@/components/interviews/create-interview-dialog';
import { StatusBadge } from '@/components/interviews/status-badge';
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  MoreHorizontal,
  ArrowRight,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ... (Types)
type Interview = {
  id: string;
  candidateName: string;
  jobRole?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'EVALUATED';
  scheduledAt: string;
  averageScore?: number;
};

// ... (Fetcher)
const fetchInterviews = async () => {
  const res = await fetch('/api/interviews');
  if (!res.ok) throw new Error('Failed to fetch interviews');
  return res.json() as Promise<Interview[]>;
};

// Custom Card Component for Bento feel
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
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: fetchInterviews,
  });

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

      {/* Bento Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetric
          label="Total Candidates"
          value={total}
          icon={Users}
          colorClass="bg-[#FAFAF9]" // Cream
        />
        <DashboardMetric
          label="Upcoming"
          value={scheduled}
          icon={Calendar}
          colorClass="bg-[#FEF08A]" // Yellow
        />
        <DashboardMetric
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          colorClass="bg-[#ECFDF5]" // Green
        />
        <DashboardMetric
          label="Avg Score"
          value={avgScore.toFixed(1)}
          icon={TrendingUp}
          colorClass="bg-[#E5E7EB]" // Grey/Neutral (No Purple!)
        />
      </div>

      {/* Main Content Area: Recent Interviews Grid */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#FAFAF9]/50">
          <div>
            <h2 className="text-xl font-bold font-heading">Recent Interviews</h2>
            <p className="text-sm text-muted-foreground">Manage your hiring pipeline</p>
          </div>
          <Button variant="ghost" className="text-sm font-medium hover:bg-transparent hover:underline">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading pipeline...</div>
          ) : interviews?.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">📝</div>
              <h3 className="font-heading font-bold text-lg mb-2">No interviews yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Get started by scheduling your first AI-powered interview.</p>
              <CreateInterviewDialog>
                <Button className="rounded-full bg-[#1A3305]">Schedule Now</Button>
              </CreateInterviewDialog>
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
                  {interviews?.map((interview) => (
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
                        <div className="invisible group-hover:visible">
                          <Link href={`/dashboard/interview/${interview.id}`}>
                            <Button size="sm" variant="outline" className="rounded-full h-8 px-4 bg-white hover:bg-[#FEF08A] hover:border-[#FEF08A] hover:text-black border-gray-200">
                              View Details
                            </Button>
                          </Link>
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
