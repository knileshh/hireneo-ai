import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/jobs/public - List all active jobs (public, no auth required)
 * This endpoint is for candidates browsing available positions
 */
export async function GET() {
    try {
        const allJobs = await db.query.jobs.findMany({
            where: eq(jobs.isActive, true),
            orderBy: [desc(jobs.createdAt)],
            with: {
                candidates: {
                    columns: { id: true }, // Only get IDs for count
                },
            },
        });

        // Add candidate counts and remove sensitive data
        const publicJobs = allJobs.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            level: job.level,
            department: job.department,
            createdAt: job.createdAt,
            candidateCount: job.candidates?.length || 0,
        }));

        return NextResponse.json({ jobs: publicJobs });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch public jobs');
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}
