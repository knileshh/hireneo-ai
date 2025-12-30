import { Worker, Job } from 'bullmq';
import { ReminderJobData } from '../factory';
import { resendClient } from '@/lib/integrations/resend/client';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

import { getRedisConnection } from '../connection';

// Use the centralized connection helper
const connection = getRedisConnection();

/**
 * Reminder worker - sends scheduled interview reminders
 */
export const reminderWorker = new Worker<ReminderJobData>(
    'reminder',
    async (job: Job<ReminderJobData>) => {
        const { interviewId, candidateName, candidateEmail, scheduledAt, reminderType } = job.data;

        logger.info({
            jobId: job.id,
            interviewId,
            reminderType,
        }, 'Processing reminder job');

        try {
            const timeLabel = reminderType === '24h' ? 'tomorrow' : 'in 1 hour';

            // Send reminder email (reusing resend client)
            await resendClient.sendInterviewConfirmation({
                to: candidateEmail,
                candidateName,
                interviewerEmail: 'team@hireneo.ai',
                scheduledAt: new Date(scheduledAt),
                meetingLink: undefined,
            });

            logger.info({
                jobId: job.id,
                interviewId,
                reminderType,
            }, 'Reminder email sent successfully');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error({
                jobId: job.id,
                interviewId,
                error: errorMessage,
            }, 'Reminder job failed');
            throw error;
        }
    },
    {
        connection,
        concurrency: 5,
    }
);

// Error handling
reminderWorker.on('failed', (job, error) => {
    logger.error({
        jobId: job?.id,
        interviewId: job?.data.interviewId,
        error: error.message,
    }, 'Reminder worker job permanently failed');
});

logger.info('Reminder worker started');
