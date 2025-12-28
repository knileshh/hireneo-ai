#!/usr/bin/env node

/**
 * Worker process entry point
 * Starts all BullMQ workers in a separate process from the Next.js app
 * 
 * Usage: tsx scripts/worker.ts
 */

// Load environment variables FIRST (Next.js does this automatically, but tsx doesn't)
import 'dotenv/config';

import '../src/lib/queue/workers/email.worker';
import '../src/lib/queue/workers/evaluation.worker';

// Load environment variables
import { env } from '../src/lib/env';
import { logger } from '../src/lib/logger';

logger.info('Starting all workers', {
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    nodeEnv: env.NODE_ENV,
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception in worker process', { error: error.message });
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection in worker process', { reason });
    process.exit(1);
});
