import { Worker, Job } from 'bullmq';
import { EvaluationJobData } from '../factory';
import { generateInterviewEvaluation } from '@/lib/integrations/openai/client';
import { db } from '@/lib/db';
import { evaluations, interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

// Use Upstash if configured, otherwise fall back to local Redis
const connection = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? {
        host: new URL(env.UPSTASH_REDIS_REST_URL).hostname,
        port: 6379,
        password: env.UPSTASH_REDIS_REST_TOKEN,
        tls: {},
    }
    : {
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

        logger.info({
            jobId: job.id,
            interviewId,
            attempt: job.attemptsMade + 1,
            noteLength: notes.length,
        }, 'Processing evaluation job');

        try {
            // Idempotency check - prevent duplicate evaluations
            const existingEvaluation = await db.query.evaluations.findFirst({
                where: eq(evaluations.interviewId, interviewId),
            });

            if (existingEvaluation) {
                logger.info({
                    jobId: job.id,
                    interviewId,
                    evaluationId: existingEvaluation.id,
                }, 'Evaluation already exists, skipping');
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

            logger.info({
                jobId: job.id,
                interviewId,
                evaluationId: savedEvaluation.id,
                score: savedEvaluation.score,
            }, 'Evaluation job completed successfully');

            return savedEvaluation;

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorName = error instanceof Error ? error.name : 'UnknownError';
            logger.error({
                jobId: job.id,
                interviewId,
                error: errorMessage,
                errorType: errorName,
                attempt: job.attemptsMade + 1,
            }, 'Evaluation job failed');

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
    logger.error({
        jobId: job?.id,
        interviewId: job?.data.interviewId,
        error: error.message,
        attempts: job?.attemptsMade,
    }, 'Evaluation worker job permanently failed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing evaluation worker gracefully');
    await evaluationWorker.close();
});

logger.info('Evaluation worker started');
