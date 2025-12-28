import { Queue, QueueOptions } from 'bullmq';
import { env } from '../env';

// Redis connection configuration
const connection = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
};

// Email queue for sending interview confirmations
export const emailQueue = new Queue('email', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000, // 2s, 4s, 8s
        },
        removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
            count: 500, // Keep last 500 failed jobs for debugging
        },
    },
});

// Evaluation queue for AI-powered interview evaluations
export const evaluationQueue = new Queue('evaluation', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            count: 100,
        },
        removeOnFail: {
            count: 500,
        },
    },
});

// Export job data types for type safety
export interface EmailJobData {
    interviewId: string;
    candidateName: string;
    candidateEmail: string;
    interviewerEmail: string;
    scheduledAt: string; // ISO string
    meetingLink?: string;
}

export interface EvaluationJobData {
    interviewId: string;
    notes: string;
}
