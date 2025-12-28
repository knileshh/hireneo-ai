import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { candidateResponses, interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/interviews/[id]/responses
 * Get all candidate responses for an interview
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Verify interview exists
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, id),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Fetch all responses
        const responses = await db.query.candidateResponses.findMany({
            where: eq(candidateResponses.interviewId, id),
            orderBy: (responses, { asc }) => [asc(responses.questionIndex)],
        });

        return NextResponse.json({
            responses,
            totalCount: responses.length,
        });

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to fetch responses');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
