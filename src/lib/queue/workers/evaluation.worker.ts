import { Worker, Job } from 'bullmq';
import { EvaluationJobData } from '../factory';
import { generateInterviewEvaluation } from '@/lib/integrations/openai/client';
import { db } from '@/lib/db';
import { evaluations, interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const connection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
};

/**
 * Evaluation worker - processes AI-powered interview evaluations
 */
export const evaluationWorker = new Worker<EvaluationJobData>(
    'evaluation',
    async (job: Job<EvaluationJobData>) => {
        const { interviewId, notes } = job.data;

        logger.info('Processing evaluation job', {
            jobId: job.id,
            interviewId,
            attempt: job.attemptsMade + 1,
            noteLength: notes.length,
        });

        try {
            // Idempotency check - prevent duplicate evaluations
            const existingEvaluation = await db.query.evaluations.findFirst({
                where: eq(evaluations.interviewId, interviewId),
            });

            if (existingEvaluation) {
                logger.info('Evaluation already exists, skipping', {
                    jobId: job.id,
                    interviewId,
                    evaluationId: existingEvaluation.id,
                });
                return existingEvaluation;
            }

            // Generate AI evaluation
            const evaluation = await generateInterviewEvaluation(notes, interviewId);

            // Save evaluation to database
            const [savedEvaluation] = await db
                .insert(evaluations)
                .values({
                    interviewId,
                    score: evaluation.score,
                    summary: evaluation.summary,
                    strengths: evaluation.strengths,
                    risks: evaluation.risks,
                })
                .returning();

            // Update interview status to EVALUATED
            await db
                .update(interviews)
                .set({
                    status: 'EVALUATED',
                    updatedAt: new Date(),
                })
                .where(eq(interviews.id, interviewId));

            logger.info('Evaluation job completed successfully', {
                jobId: job.id,
                interviewId,
                evaluationId: savedEvaluation.id,
                score: savedEvaluation.score,
            });

            return savedEvaluation;

        } catch (error: any) {
            logger.error('Evaluation job failed', {
                jobId: job.id,
                interviewId,
                error: error.message,
                errorType: error.name,
                attempt: job.attemptsMade + 1,
            });

            // Re-throw to let BullMQ handle retries
            throw error;
        }
    },
    {
        connection,
        concurrency: 2, // Process 2 evaluations at a time (AI API rate limiting)
    }
);

// Error handling
evaluationWorker.on('failed', (job, error) => {
    logger.error('Evaluation worker job permanently failed', {
        jobId: job?.id,
        interviewId: job?.data.interviewId,
        error: error.message,
        attempts: job?.attemptsMade,
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing evaluation worker gracefully');
    await evaluationWorker.close();
});

logger.info('Evaluation worker started');
