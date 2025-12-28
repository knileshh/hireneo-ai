import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assessmentTokens, interviews, interviewQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * POST /api/interviews/[id]/assessment-token
 * Generate a secure assessment token for candidate
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Fetch interview
        const interview = await db.query.interviews.findFirst({
            where: eq(interviews.id, id),
        });

        if (!interview) {
            return NextResponse.json(
                { error: 'Interview not found' },
                { status: 404 }
            );
        }

        // Check if token already exists
        const existingToken = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.interviewId, id),
        });

        if (existingToken && existingToken.expiresAt > new Date()) {
            // Return existing valid token
            return NextResponse.json({
                token: existingToken.token,
                assessmentUrl: `/assessment/${existingToken.token}`,
                expiresAt: existingToken.expiresAt,
            });
        }

        // Generate new secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Delete old token if exists
        if (existingToken) {
            await db.delete(assessmentTokens).where(eq(assessmentTokens.id, existingToken.id));
        }

        // Create new token
        const [newToken] = await db.insert(assessmentTokens).values({
            interviewId: id,
            token,
            expiresAt,
        }).returning();

        logger.info({
            interviewId: id,
            tokenId: newToken.id,
        }, 'Assessment token generated');

        return NextResponse.json({
            token: newToken.token,
            assessmentUrl: `/assessment/${newToken.token}`,
            expiresAt: newToken.expiresAt,
        });

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to generate assessment token');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/interviews/[id]/assessment-token
 * Get existing assessment token for an interview
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const token = await db.query.assessmentTokens.findFirst({
            where: eq(assessmentTokens.interviewId, id),
        });

        if (!token) {
            return NextResponse.json(
                { error: 'No assessment token found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            token: token.token,
            assessmentUrl: `/assessment/${token.token}`,
            expiresAt: token.expiresAt,
            usedAt: token.usedAt,
            completedAt: token.completedAt,
            isExpired: token.expiresAt < new Date(),
            isUsed: !!token.usedAt,
            isCompleted: !!token.completedAt,
        });

    } catch (error) {
        logger.error({ interviewId: id, err: error }, 'Failed to get assessment token');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
