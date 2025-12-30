import { Queue } from 'bullmq';
import { env } from '@/lib/env';
import { getRedisConnection } from './connection';

// Use the centralized connection helper for BullMQ
const connection = getRedisConnection();

// Email job data
export interface EmailJobData {
    interviewId: string;
    candidateName: string;
    candidateEmail: string;
    interviewerEmail: string;
    scheduledAt: string;
    meetingLink?: string;
}

// Welcome email job data
export interface WelcomeEmailJobData {
    userId: string;
    userEmail: string;
    userName: string;
    userRole: 'candidate' | 'recruiter';
}

// Evaluation job data
export interface EvaluationJobData {
    interviewId: string;
    notes: string;
}

// Reminder job data
export interface ReminderJobData {
    interviewId: string;
    candidateName: string;
    candidateEmail: string;
    scheduledAt: string;
    reminderType: '24h' | '1h';
}

// Email queue for interview confirmations
export const emailQueue = new Queue<EmailJobData>('email', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    },
});

// Welcome email queue for new user signups
export const welcomeEmailQueue = new Queue<WelcomeEmailJobData>('welcome-email', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    },
});

// Evaluation queue for AI processing
export const evaluationQueue = new Queue<EvaluationJobData>('evaluation', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000,
        },
        removeOnComplete: 50,
        removeOnFail: 500,
    },
});

// Reminder queue for scheduled reminders
export const reminderQueue = new Queue<ReminderJobData>('reminder', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});

/**
 * Schedule reminder jobs for an interview
 * Called after interview is created
 */
export async function scheduleReminders(data: {
    interviewId: string;
    candidateName: string;
    candidateEmail: string;
    scheduledAt: Date;
}) {
    const scheduledTime = data.scheduledAt.getTime();
    const now = Date.now();

    // 24 hour reminder
    const reminder24h = scheduledTime - 24 * 60 * 60 * 1000;
    if (reminder24h > now) {
        await reminderQueue.add(
            'send-reminder',
            {
                interviewId: data.interviewId,
                candidateName: data.candidateName,
                candidateEmail: data.candidateEmail,
                scheduledAt: data.scheduledAt.toISOString(),
                reminderType: '24h',
            },
            {
                jobId: `reminder-24h-${data.interviewId}`,
                delay: reminder24h - now,
            }
        );
    }

    // 1 hour reminder
    const reminder1h = scheduledTime - 60 * 60 * 1000;
    if (reminder1h > now) {
        await reminderQueue.add(
            'send-reminder',
            {
                interviewId: data.interviewId,
                candidateName: data.candidateName,
                candidateEmail: data.candidateEmail,
                scheduledAt: data.scheduledAt.toISOString(),
                reminderType: '1h',
            },
            {
                jobId: `reminder-1h-${data.interviewId}`,
                delay: reminder1h - now,
            }
        );
    }
}
