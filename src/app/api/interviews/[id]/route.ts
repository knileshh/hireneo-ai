import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { transitionStatus } from '@/lib/domain/interview-state-machine';
import { logger } from '@/lib/logger';

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
    { params }: { params: { id: string } }
) {
    try {
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, params.id),
            with: {
                evaluations: true,
            },
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(interview);

    } catch (error) {
        logger.error('Failed to fetch interview', { interviewId: params.id, error });
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
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const validated = updateInterviewSchema.parse(body);

        // Fetch current interview
        const currentInterview = await db.query.interviews.findFirst({
            where: eq(interviews.id, params.id),
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
            } catch (error: any) {
                return NextResponse.json(
                    { error: error.message },
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
            .where(eq(interviews.id, params.id))
            .returning();

        logger.info('Interview updated', {
            interviewId: params.id,
            updates: validated,
        });

        return NextResponse.json(updatedInterview);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error('Failed to update interview', { interviewId: params.id, error });
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
