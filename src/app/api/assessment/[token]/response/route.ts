import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTokens, interviews, candidateResponses, interviewQuestions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const submitResponseSchema = z.object({
    questionIndex: z.number(),
    question: z.string(),
    category: z.enum(['personal', 'behavioral', 'technical']),
    timeLimit: z.number(),
    transcript: z.string().optional(),
    textAnswer: z.string().optional(),
    durationSeconds: z.number(),
});

/**
 * POST /api/assessment/[token]/response
 * Submit a response to a question
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        // Validate token
        const tokenRecord = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.token, token),
        });

        if (!tokenRecord) {
            return NextResponse.json(
                { error: 'Invalid assessment link' },
                { status: 404 }
            );
        }

        if (tokenRecord.expiresAt < new Date() || tokenRecord.completedAt) {
            return NextResponse.json(
                { error: 'This assessment is no longer available' },
                { status: 410 }
            );
        }

        // Parse and validate body
        const body = await req.json();
        const validated = submitResponseSchema.parse(body);

        // Check if response already exists for this question
        const existingResponse = await db.query.candidateResponses.findFirst({
            where: and(
                eq(candidateResponses.interviewId, tokenRecord.interviewId),
                eq(candidateResponses.questionIndex, validated.questionIndex)
            ),
        });

        if (existingResponse) {
            // Update existing response
            const [updated] = await db.update(candidateResponses)
                .set({
                    transcript: validated.transcript,
                    textAnswer: validated.textAnswer,
                    durationSeconds: validated.durationSeconds,
                    submittedAt: new Date(),
                })
                .where(eq(candidateResponses.id, existingResponse.id))
                .returning();

            return NextResponse.json({
                success: true,
                responseId: updated.id,
                message: 'Response updated'
            });
        }

        // Create new response
        const [response] = await db.insert(candidateResponses).values({
            interviewId: tokenRecord.interviewId,
            questionIndex: validated.questionIndex,
            question: validated.question,
            category: validated.category,
            timeLimit: validated.timeLimit,
            transcript: validated.transcript,
            textAnswer: validated.textAnswer,
            durationSeconds: validated.durationSeconds,
            submittedAt: new Date(),
        }).returning();

        logger.info({
            token,
            interviewId: tokenRecord.interviewId,
            questionIndex: validated.questionIndex,
        }, 'Response submitted');

        return NextResponse.json({
            success: true,
            responseId: response.id,
            message: 'Response saved'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request', details: error.errors },
                { status: 400 }
            );
        }
        logger.error({ token, err: error }, 'Failed to submit response');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
