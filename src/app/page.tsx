'use client';

import { useQuery } from '@tanstack/react-query';
import { Interview } from '@/lib/db/schema';

export default function DashboardPage() {
  const { data: interviewsData, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const res = await fetch('/api/interviews');
      if (!res.ok) throw new Error('Failed to fetch interviews');
      return res.json() as Promise<{ data: Interview[]; pagination: any }>;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const interviews = interviewsData?.data || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CREATED: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      EVALUATION_PENDING: 'bg-yellow-100 text-yellow-800',
      EVALUATED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HireNeo AI</h1>
          <p className="text-gray-600">Interview Orchestration Dashboard</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No interviews yet. Create one via the API!</p>
            <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {`POST /api/interviews
{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "interviewerEmail": "interviewer@company.com",
  "scheduledAt": "2025-12-30T10:00:00Z"
}`}
            </pre>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.map((interview: any) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {interview.candidateName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {interview.candidateEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(interview.scheduledAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📊 Live Polling Active</h3>
          <p className="text-sm text-blue-700">
            This dashboard auto-refreshes every 5 seconds to show real-time status updates from background workers.
          </p>
        </div>
      </div>
    </div>
  );
}
