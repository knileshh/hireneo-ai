import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interviews, evaluations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { evaluationQueue, EvaluationJobData } from '@/lib/queue/factory';
import { logger } from '@/lib/logger';

/**
 * POST /api/interviews/[id]/evaluate
 * Trigger AI evaluation for an interview
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Fetch interview
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, id),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Check if interview is in COMPLETED state
        if (interview.status !== 'COMPLETED') {
            return NextResponse.json(
                { error: 'Interview must be in COMPLETED status to evaluate' },
                { status: 400 }
            );
        }

        // Check if evaluation already exists
        const existingEvaluation = await db.query.evaluations.findFirst({
            where: eq(evaluations.interviewId, id),
        });

        if (existingEvaluation) {
            return NextResponse.json({
                message: 'Evaluation already exists',
                evaluation: existingEvaluation,
            });
        }

        // Update interview status to EVALUATION_PENDING
        await db
            .update(interviews)
            .set({
                status: 'EVALUATION_PENDING',
                updatedAt: new Date(),
            })
            .where(eq(interviews.id, id));

        // Queue evaluation job
        const jobData: EvaluationJobData = {
            interviewId: interview.id,
            notes: interview.notes || '',
        };

        const job = await evaluationQueue.add('evaluate-interview', jobData, {
            jobId: `eval-${interview.id}`, // Idempotency key
        });

        logger.info('Evaluation job queued', {
            interviewId: interview.id,
            jobId: job.id,
        });

        return NextResponse.json({
            message: 'Evaluation queued successfully',
            jobId: job.id,
        }, { status: 202 });

    } catch (error) {
        logger.error('Failed to trigger evaluation', { interviewId: id, error });
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
