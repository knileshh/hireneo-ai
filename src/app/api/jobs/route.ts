import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Validation schema for creating a job
const createJobSchema = z.object({
    title: z.string().min(1, 'Job title is required'),
    description: z.string().optional(),
    requirements: z.array(z.string()).optional().default([]),
    level: z.enum(['junior', 'mid', 'senior', 'lead', 'manager']).optional(),
    department: z.string().optional(),
});

/**
 * GET /api/jobs - List all jobs
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allJobs = await db.query.jobs.findMany({
            where: eq(jobs.userId, user.id),
            orderBy: [desc(jobs.createdAt)],
            with: {
                candidates: true,
            },
        });

        // Add candidate counts
        const jobsWithCounts = allJobs.map(job => ({
            ...job,
            candidateCount: job.candidates?.length || 0,
            candidates: undefined, // Don't send full candidate list
        }));

        return NextResponse.json({ jobs: jobsWithCounts });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch jobs');
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/jobs - Create a new job
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validated = createJobSchema.parse(body);

        const [newJob] = await db.insert(jobs).values({
            userId: user.id,
            title: validated.title,
            description: validated.description || null,
            requirements: validated.requirements,
            level: validated.level || null,
            department: validated.department || null,
        }).returning();

        logger.info({ jobId: newJob.id, userId: user.id }, 'Job created');

        return NextResponse.json({ job: newJob }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ err: error }, 'Failed to create job');
        return NextResponse.json(
            { error: 'Failed to create job' },
            { status: 500 }
        );
    }
}
