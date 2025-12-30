import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { interviews } from '@/lib/db/schema';
import { emailQueue, EmailJobData } from '@/lib/queue/factory';
import { logger } from '@/lib/logger';
import { desc, like, or, count, eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';

// Validation schemas
const createInterviewSchema = z.object({
    candidateName: z.string().min(1, 'Candidate name is required'),
    candidateEmail: z.string().email('Valid email required'),
    interviewerEmail: z.string().email('Valid interviewer email required'),
    scheduledAt: z.string().datetime('Valid ISO datetime required'),
    meetingLink: z.string().url().optional(),
    notes: z.string().optional(),
    jobRole: z.string().optional(),
    jobLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'manager']).optional(),
});

const listInterviewsSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional(),
    status: z.enum(['CREATED', 'SCHEDULED', 'COMPLETED', 'EVALUATION_PENDING', 'EVALUATED']).optional(),
});

/**
 * POST /api/interviews
 * Create a new interview and queue confirmation email
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validated = createInterviewSchema.parse(body);

        logger.info({
            candidateName: validated.candidateName,
            candidateEmail: validated.candidateEmail,
            userId: user.id,
        }, 'Creating new interview');

        // Insert interview into database
        const [interview] = await db
            .insert(interviews)
            .values({
                userId: user.id,
                candidateName: validated.candidateName,
                candidateEmail: validated.candidateEmail,
                interviewerEmail: validated.interviewerEmail,
                scheduledAt: new Date(validated.scheduledAt),
                status: 'CREATED',
                meetingLink: validated.meetingLink,
                notes: validated.notes,
                jobRole: validated.jobRole,
                jobLevel: validated.jobLevel,
            })
            .returning();

        // Queue email confirmation job
        const emailJobData: EmailJobData = {
            interviewId: interview.id,
            candidateName: interview.candidateName,
            candidateEmail: interview.candidateEmail,
            interviewerEmail: interview.interviewerEmail,
            scheduledAt: interview.scheduledAt.toISOString(),
            meetingLink: interview.meetingLink || undefined,
        };

        await emailQueue.add('send-confirmation', emailJobData, {
            jobId: `email-${interview.id}`, // Idempotency key
        });

        // Update status to SCHEDULED after email queued
        const [updatedInterview] = await db
            .update(interviews)
            .set({ status: 'SCHEDULED' })
            .where(eq(interviews.id, interview.id))
            .returning();

        logger.info({ interviewId: interview.id }, 'Interview created and email queued');

        return NextResponse.json(updatedInterview, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ err: error }, 'Failed to create interview');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/interviews
 * List interviews with pagination, filtering, and search
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = req.url ? new URL(req.url) : { searchParams: new URLSearchParams() };

        // Build params object, filtering out null values
        const params: Record<string, string> = {};
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        if (status) params.status = status;

        const validated = listInterviewsSchema.parse(params);

        const offset = (validated.page - 1) * validated.limit;

        // Build conditions
        const conditions = [eq(interviews.userId, user.id)];

        if (validated.search) {
            conditions.push(or(
                like(interviews.candidateName, `%${validated.search}%`),
                like(interviews.candidateEmail, `%${validated.search}%`)
            )!);
        }

        if (validated.status) {
            conditions.push(eq(interviews.status, validated.status));
        }

        // Execute query with pagination
        const query = db.select()
            .from(interviews)
            .where(and(...conditions))
            .orderBy(desc(interviews.createdAt))
            .limit(validated.limit)
            .offset(offset);

        const results = await query;

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(interviews)
            .where(and(...conditions)!);

        return NextResponse.json({
            data: results,
            pagination: {
                page: validated.page,
                limit: validated.limit,
                total,
                totalPages: Math.ceil(total / validated.limit),
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.errors },
                { status: 400 }
            );
        }

        logger.error({ err: error }, 'Failed to list interviews');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
