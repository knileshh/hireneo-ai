import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { candidates, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/candidate/applications - Get all applications for the current candidate
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all candidates where userId matches the current user
        const userCandidates = await db.query.candidates.findMany({
            where: eq(candidates.userId, user.id),
            with: {
                job: true,
            },
            orderBy: (c, { desc }) => [desc(c.createdAt)],
        });

        // Transform to application format
        const applications = userCandidates.map(c => ({
            id: c.id,
            jobId: c.jobId,
            jobTitle: c.job?.title || 'Unknown Position',
            company: c.job?.department || 'HireNeo',
            status: c.status,
            appliedAt: c.createdAt?.toISOString() || new Date().toISOString(),
            matchScore: c.matchScore,
            interviewId: c.interviewId,
            invitedAt: c.invitedAt?.toISOString(),
        }));

        return NextResponse.json({ applications });
    } catch (error: any) {
        console.error('Get applications error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get applications' },
            { status: 500 }
        );
    }
}
