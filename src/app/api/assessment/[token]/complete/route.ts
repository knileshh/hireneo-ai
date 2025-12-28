import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTokens, interviews, candidateResponses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { evaluationQueue } from '@/lib/queue/factory';

/**
 * POST /api/assessment/[token]/complete
 * Mark assessment as complete and trigger evaluation
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        // Validate token
        const tokenRecord = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.token, token),
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { error: 'Invalid assessment link' },
                { status: 404 }
            );
        }

        if (tokenRecord.completedAt) {
            return NextResponse.json(
                { error: 'Assessment already completed' },
                { status: 410 }
            );
        }

        // Get all responses
        const responses = await db.query.candidateResponses.findMany({
            where: eq(candidateResponses.interviewId, tokenRecord.interviewId),
        });

        // Mark token as completed
        await db.update(assessmentTokens)
            .set({ completedAt: new Date() })
            .where(eq(assessmentTokens.id, tokenRecord.id));

        // Update interview status to COMPLETED
        await db.update(interviews)
            .set({
                status: 'COMPLETED',
                updatedAt: new Date()
            })
            .where(eq(interviews.id, tokenRecord.interviewId));

        // Build notes from responses for AI evaluation
        const notes = responses.map(r => {
            const answer = r.transcript || r.textAnswer || 'No answer provided';
            return `Question ${r.questionIndex + 1} (${r.category}): ${r.question}\nAnswer: ${answer}\n`;
        }).join('\n---\n');

        // Queue evaluation job
        const job = await evaluationQueue.add('evaluate-interview', {
            interviewId: tokenRecord.interviewId,
            notes,
        }, {
            jobId: `eval-${tokenRecord.interviewId}`,
        });

        logger.info({
            token,
            interviewId: tokenRecord.interviewId,
            responsesCount: responses.length,
            jobId: job.id,
        }, 'Assessment completed, evaluation queued');

        return NextResponse.json({
            success: true,
            message: 'Assessment completed! Your responses are being evaluated.',
            responsesSubmitted: responses.length,
        });

    } catch (error) {
        logger.error({ token, err: error }, 'Failed to complete assessment');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
