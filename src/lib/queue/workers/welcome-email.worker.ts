import { Worker, Job } from 'bullmq';
import { WelcomeEmailJobData } from '../factory';
import { resendClient } from '@/lib/integrations/resend/client';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

import { getRedisConnection } from '../connection';

// Use the centralized connection helper
const connection = getRedisConnection();

/**
 * Welcome email worker - processes welcome emails for new users
 */
export const welcomeEmailWorker = new Worker<WelcomeEmailJobData>(
    'welcome-email',
    async (job: Job<WelcomeEmailJobData>) => {
        const { userId, userEmail, userName, userRole } = job.data;

        logger.info({
            jobId: job.id,
            userId,
            userEmail,
            userRole,
            attempt: job.attemptsMade + 1,
        }, 'Processing welcome email job');

        try {
            // Send welcome email
            const result = await resendClient.sendWelcomeEmail({
                to: userEmail,
                userName,
                userRole,
            });

            logger.info({
                jobId: job.id,
                userId,
                emailId: result.data?.id,
            }, 'Welcome email job completed successfully');

            return result;

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error({
                jobId: job.id,
                userId,
                error: errorMessage,
                attempt: job.attemptsMade + 1,
            }, 'Welcome email job failed');

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
welcomeEmailWorker.on('failed', (job, error) => {
    logger.error({
        jobId: job?.id,
        userId: job?.data.userId,
        error: error.message,
        attempts: job?.attemptsMade,
    }, 'Welcome email worker job permanently failed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing welcome email worker gracefully');
    await welcomeEmailWorker.close();
});

logger.info('Welcome email worker started');
