import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateInterviewQuestions } from '@/lib/integrations/openai/questions';
import { logger } from '@/lib/logger';

const generateQuestionsSchema = z.object({
    jobRole: z.string().min(1, 'Job role is required'),
    jobLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'manager']),
});

/**
 * POST /api/interviews/[id]/questions
 * Generate AI-powered interview questions
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await req.json();
        const validated = generateQuestionsSchema.parse(body);

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

        // Check if questions already exist
        const existingQuestions = await db.query.interviewQuestions.findFirst({
            where: eq(interviewQuestions.interviewId, id),
        });

        if (existingQuestions) {
            return NextResponse.json({
                message: 'Questions already generated',
                questions: existingQuestions,
            });
        }

        // Generate questions using AI
        const generated = await generateInterviewQuestions(
            validated.jobRole,
            validated.jobLevel,
            id
        );

        // Save questions to database
        const [savedQuestions] = await db
            .insert(interviewQuestions)
            .values({
                interviewId: id,
                jobRole: validated.jobRole,
                jobLevel: validated.jobLevel,
                questions: generated.questions,
            })
            .returning();

        // Update interview with job info
        await db
            .update(interviews)
            .set({
                jobRole: validated.jobRole,
                jobLevel: validated.jobLevel,
                updatedAt: new Date(),
            })
            .where(eq(interviews.id, id));

        logger.info({ interviewId: id }, 'Interview questions saved');

        return NextResponse.json(savedQuestions, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ interviewId: id, err: error }, 'Failed to generate questions');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/interviews/[id]/questions
 * Get interview questions
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const questions = await db.query.interviewQuestions.findFirst({
            where: eq(interviewQuestions.interviewId, id),
        });

        if (!questions) {
            return NextResponse.json(
                { error: 'Questions not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(questions);

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to fetch questions');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
