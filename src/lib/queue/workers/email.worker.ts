import { Worker, Job } from 'bullmq';
import { EmailJobData } from '../factory';
import { resendClient } from '@/lib/integrations/resend/client';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const connection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
};

/**
 * Email worker - processes interview confirmation emails
 */
export const emailWorker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
        const { interviewId, candidateName, candidateEmail, interviewerEmail, scheduledAt, meetingLink } = job.data;

        logger.info({
            jobId: job.id,
            interviewId,
            attempt: job.attemptsMade + 1,
        }, 'Processing email job');

        try {
            // Send interview confirmation email
            const result = await resendClient.sendInterviewConfirmation({
                to: candidateEmail,
                candidateName,
                interviewerEmail,
                scheduledAt: new Date(scheduledAt),
                meetingLink,
            });

            logger.info({
                jobId: job.id,
                interviewId,
                emailId: result.data?.id,
            }, 'Email job completed successfully');

            return result;

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error({
                jobId: job.id,
                interviewId,
                error: errorMessage,
                attempt: job.attemptsMade + 1,
            }, 'Email job failed');

            // Re-throw to let BullMQ handle retries
            throw error;
        }
    },
    {
        connection,
        concurrency: 5, // Process 5 emails concurrently
    }
);

// Error handling
emailWorker.on('failed', (job, error) => {
    logger.error({
        jobId: job?.id,
        interviewId: job?.data.interviewId,
        error: error.message,
        attempts: job?.attemptsMade,
    }, 'Email worker job permanently failed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing email worker gracefully');
    await emailWorker.close();
});

logger.info('Email worker started');
