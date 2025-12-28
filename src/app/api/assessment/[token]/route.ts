import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTokens, interviews, interviewQuestions, candidateResponses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/assessment/[token]
 * Get assessment details for a candidate (public, no auth required)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        // Find token and validate
        const tokenRecord = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.token, token),
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { error: 'Invalid assessment link' },
                { status: 404 }
            );
        }

        if (tokenRecord.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'This assessment link has expired' },
                { status: 410 }
            );
        }

        if (tokenRecord.completedAt) {
            return NextResponse.json(
                { error: 'This assessment has already been completed' },
                { status: 410 }
            );
        }

        // Get interview details
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, tokenRecord.interviewId),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Get questions
        const questionsRecord = await db.query.interviewQuestions.findFirst({
            where: eq(interviewQuestions.interviewId, tokenRecord.interviewId),
        });

        // Get any existing responses (for resuming)
        const existingResponses = await db.query.candidateResponses.findMany({
            where: eq(candidateResponses.interviewId, tokenRecord.interviewId),
        });

        return NextResponse.json({
            interview: {
                candidateName: interview.candidateName,
                jobRole: interview.jobRole || 'Interview Assessment',
                jobLevel: interview.jobLevel,
            },
            questions: questionsRecord?.questions || [],
            completedQuestions: existingResponses.map(r => r.questionIndex),
            isStarted: !!tokenRecord.usedAt,
            totalQuestions: questionsRecord?.questions?.length || 0,
        });

    } catch (error) {
        logger.error({ token, err: error }, 'Failed to get assessment');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/assessment/[token]
 * Start the assessment (marks token as used)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const tokenRecord = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.token, token),
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { error: 'Invalid assessment link' },
                { status: 404 }
            );
        }

        if (tokenRecord.expiresAt < new Date()) {
            return NextResponse.json(
                { error: 'This assessment link has expired' },
                { status: 410 }
            );
        }

        if (tokenRecord.completedAt) {
            return NextResponse.json(
                { error: 'This assessment has already been completed' },
                { status: 410 }
            );
        }

        // Mark as started if not already
        if (!tokenRecord.usedAt) {
            await db.update(assessmentTokens)
                .set({ usedAt: new Date() })
                .where(eq(assessmentTokens.id, tokenRecord.id));

            // Update interview status to IN_PROGRESS
            await db.update(interviews)
                .set({
                    status: 'IN_PROGRESS',
                    updatedAt: new Date()
                })
                .where(eq(interviews.id, tokenRecord.interviewId));

            logger.info({ token, interviewId: tokenRecord.interviewId }, 'Assessment started');
        }

        return NextResponse.json({ success: true, message: 'Assessment started' });

    } catch (error) {
        logger.error({ token, err: error }, 'Failed to start assessment');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
