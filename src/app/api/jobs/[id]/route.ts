import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs, candidates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/jobs/[id] - Get job details with candidates
 */
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, id),
            with: {
                candidates: {
                    orderBy: (c, { desc }) => [desc(c.matchScore)],
                },
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ job });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch job');
        return NextResponse.json(
            { error: 'Failed to fetch job' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/jobs/[id] - Update job
 */
export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { title, description, requirements, level, department, isActive } = body;

        const [updatedJob] = await db.update(jobs)
            .set({
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(requirements !== undefined && { requirements }),
                ...(level !== undefined && { level }),
                ...(department !== undefined && { department }),
                ...(isActive !== undefined && { isActive }),
                updatedAt: new Date(),
            })
            .where(eq(jobs.id, id))
            .returning();

        if (!updatedJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ job: updatedJob });
    } catch (error) {
        logger.error({ err: error }, 'Failed to update job');
        return NextResponse.json(
            { error: 'Failed to update job' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/jobs/[id] - Delete job (candidates cascade deleted via FK)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Delete job - candidates are cascade deleted via FK constraints
        const [deletedJob] = await db.delete(jobs)
            .where(eq(jobs.id, id))
            .returning();

        if (!deletedJob) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        logger.info({ jobId: id }, 'Job deleted');

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, 'Failed to delete job');
        return NextResponse.json(
            { error: 'Failed to delete job' },
            { status: 500 }
        );
    }
}
