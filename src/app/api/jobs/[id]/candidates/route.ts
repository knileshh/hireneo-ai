import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { candidates, jobs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { parseResume, scoreCandidate } from '@/lib/integrations/ai/resume-parser';
import { uploadResume } from '@/lib/supabase/storage';
import { extractTextFromFile } from '@/lib/utils/file-parser';
import { logger } from '@/lib/logger';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/jobs/[id]/candidates - List candidates for a job
 */
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;

        // Verify user owns the job
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check job ownership
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
            columns: { id: true, userId: true },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (job.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobCandidates = await db.query.candidates.findMany({
            where: eq(candidates.jobId, jobId),
            orderBy: [desc(candidates.matchScore)],
        });

        return NextResponse.json({ candidates: jobCandidates });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch candidates');
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/jobs/[id]/candidates - Apply to job with resume
 * Accepts: application/json with resumeText or resumeUrl
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if job exists
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Prevent applying to your own job
        if (job.userId === user.id) {
            return NextResponse.json(
                { error: 'You cannot apply to your own job posting' },
                { status: 400 }
            );
        }

        // Check if user is a recruiter (owns any jobs)
        const userJobs = await db.query.jobs.findFirst({
            where: eq(jobs.userId, user.id),
        });

        if (userJobs) {
            return NextResponse.json(
                { error: 'Recruiter accounts cannot apply as candidates. Please use a different email to apply.' },
                { status: 400 }
            );
        }

        // Check if user already applied to this job
        const existingApplication = await db.query.candidates.findFirst({
            where: eq(candidates.jobId, jobId),
            columns: { id: true, email: true },
        });

        if (existingApplication && existingApplication.email === user.email) {
            return NextResponse.json(
                { error: 'You have already applied to this job' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { resumeText, resumeUrl, name, email } = body;

        if (!resumeText && !resumeUrl) {
            return NextResponse.json(
                { error: 'Resume text or resume URL is required' },
                { status: 400 }
            );
        }

        let finalResumeText = resumeText;
        let finalResumeUrl = resumeUrl;

        // Parse resume using AI
        const parsedResume = await parseResume(finalResumeText);

        // Score candidate against job requirements using AI
        const matchAnalysis = await scoreCandidate(
            parsedResume,
            job.title,
            job.requirements || [],
            job.level || 'mid'
        );

        // Create candidate record
        const [newCandidate] = await db.insert(candidates).values({
            jobId,
            userId: user.id,
            name: name || parsedResume.name,
            email: email || parsedResume.email,
            phone: parsedResume.phone || null,
            resumeUrl: finalResumeUrl,
            parsedResume,
            matchScore: matchAnalysis.matchScore,
            matchAnalysis: {
                strengths: matchAnalysis.strengths,
                gaps: matchAnalysis.gaps,
                recommendation: matchAnalysis.recommendation,
            },
            status: 'NEW',
        }).returning();

        return NextResponse.json({
            success: true,
            candidate: newCandidate,
        }, { status: 201 });

    } catch (error) {
        logger.error({ err: error }, 'Failed to create candidate');
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create candidate' },
            { status: 500 }
        );
    }
}
