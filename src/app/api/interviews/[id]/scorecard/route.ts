import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews, scorecards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

const createScorecardSchema = z.object({
    technicalScore: z.number().min(1).max(5).optional(),
    communicationScore: z.number().min(1).max(5).optional(),
    cultureFitScore: z.number().min(1).max(5).optional(),
    problemSolvingScore: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/interviews/[id]/scorecard
 * Create or update interview scorecard
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await req.json();
        const validated = createScorecardSchema.parse(body);

        // Check if interview exists
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, id),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Check if scorecard already exists
        const existingScorecard = await db.query.scorecards.findFirst({
            where: eq(scorecards.interviewId, id),
        });

        let scorecard;

        if (existingScorecard) {
            // Update existing scorecard
            const [updated] = await db
                .update(scorecards)
                .set({
                    ...validated,
                    updatedAt: new Date(),
                })
                .where(eq(scorecards.interviewId, id))
                .returning();
            scorecard = updated;
            logger.info({ interviewId: id }, 'Scorecard updated');
        } else {
            // Create new scorecard
            const [created] = await db
                .insert(scorecards)
                .values({
                    interviewId: id,
                    ...validated,
                })
                .returning();
            scorecard = created;
            logger.info({ interviewId: id }, 'Scorecard created');
        }

        return NextResponse.json(scorecard, {
            status: existingScorecard ? 200 : 201
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ interviewId: id, err: error }, 'Failed to save scorecard');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/interviews/[id]/scorecard
 * Get interview scorecard
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const scorecard = await db.query.scorecards.findFirst({
            where: eq(scorecards.interviewId, id),
        });

        if (!scorecard) {
            return NextResponse.json(
                { error: 'Scorecard not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(scorecard);

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to fetch scorecard');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
