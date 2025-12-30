import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews, interviewQuestions, scorecards, evaluations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { transitionStatus } from '@/lib/domain/interview-state-machine';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

const updateInterviewSchema = z.object({
    status: z.enum(['CREATED', 'SCHEDULED', 'COMPLETED', 'EVALUATION_PENDING', 'EVALUATED']).optional(),
    notes: z.string().optional(),
    meetingLink: z.string().url().optional(),
});

/**
 * GET /api/interviews/[id]
 * Get a single interview with its evaluation
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch interview
        const interview = await db.query.interviews.findFirst({
            where: and(eq(interviews.id, id), eq(interviews.userId, user.id)),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Fetch evaluation separately
        const evaluation = await db.query.evaluations.findFirst({
            where: eq(evaluations.interviewId, id),
        });

        return NextResponse.json({
            ...interview,
            evaluation: evaluation || null,
        });

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to fetch interview');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/interviews/[id]
 * Update interview (including status via state machine)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validated = updateInterviewSchema.parse(body);

        // Fetch current interview
        const currentInterview = await db.query.interviews.findFirst({
            where: and(eq(interviews.id, id), eq(interviews.userId, user.id)),
        });

        if (!currentInterview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Validate state transition if status is being updated
        if (validated.status && validated.status !== currentInterview.status) {
            try {
                transitionStatus(currentInterview.status, validated.status);
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Invalid transition';
                return NextResponse.json(
                    { error: message },
                    { status: 400 }
                );
            }
        }

        // Update interview
        const [updatedInterview] = await db
            .update(interviews)
            .set({
                ...validated,
                updatedAt: new Date(),
            })
            .where(and(eq(interviews.id, id), eq(interviews.userId, user.id)))
            .returning();

        logger.info({
            interviewId: id,
            updates: validated,
        }, 'Interview updated');

        return NextResponse.json(updatedInterview);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ interviewId: id, err: error }, 'Failed to update interview');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/interviews/[id]
 * Delete an interview and all related data
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const interview = await db.query.interviews.findFirst({
            where: and(eq(interviews.id, id), eq(interviews.userId, user.id)),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Delete interview - related records are cascade deleted via FK constraints
        await db.delete(interviews).where(and(eq(interviews.id, id), eq(interviews.userId, user.id)));

        logger.info({ interviewId: id }, 'Interview deleted');

        return NextResponse.json({ success: true, id });

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to delete interview');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
