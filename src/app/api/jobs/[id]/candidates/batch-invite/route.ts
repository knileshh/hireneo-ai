import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { candidates, interviews, assessmentTokens, interviewQuestions, jobs } from '@/lib/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { resendClient } from '@/lib/integrations/resend/client';
import { generateInterviewQuestions } from '@/lib/integrations/openai/questions';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/jobs/[id]/candidates/batch-invite
 * AI-powered batch invite - invites top N candidates based on scores
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;
        const body = await req.json();
        const count = body.count || 3; // Default to top 3

        // Get job details
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Get top N candidates that haven't been invited yet
        const topCandidates = await db.query.candidates.findMany({
            where: and(
                eq(candidates.jobId, jobId),
                ne(candidates.status, 'INVITED')
            ),
            orderBy: [desc(candidates.matchScore)],
            limit: count,
        });

        if (topCandidates.length === 0) {
            return NextResponse.json(
                { error: 'No eligible candidates to invite' },
                { status: 400 }
            );
        }

        const results: { candidateId: string; name: string; email: string; success: boolean; error?: string }[] = [];

        // Process each candidate
        for (const candidate of topCandidates) {
            try {
                // Create interview record
                const [interview] = await db.insert(interviews).values({
                    jobId: candidate.jobId,
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    interviewerEmail: 'recruiter@hireneo.ai',
                    scheduledAt: new Date(),
                    status: 'SCHEDULED',
                    jobRole: job.title,
                    jobLevel: job.level || 'mid',
                }).returning();

                // Generate questions
                const questionsResult = await generateInterviewQuestions(
                    job.title,
                    job.level || 'mid',
                    interview.id
                );

                // Save questions
                await db.insert(interviewQuestions).values({
                    interviewId: interview.id,
                    jobRole: job.title,
                    jobLevel: job.level || 'mid',
                    questions: questionsResult.questions,
                });

                // Create assessment token
                const token = uuidv4();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                await db.insert(assessmentTokens).values({
                    interviewId: interview.id,
                    token,
                    expiresAt,
                });

                // Update candidate status
                await db.update(candidates)
                    .set({
                        status: 'INVITED',
                        interviewId: interview.id,
                        invitedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(candidates.id, candidate.id));

                // Send email
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const assessmentUrl = `${baseUrl}/assessment/${token}`;

                await resendClient.sendAssessmentInvite({
                    to: candidate.email,
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    assessmentUrl,
                    expiresAt,
                });

                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    success: true,
                });
            } catch (error) {
                console.error(`Failed to invite candidate ${candidate.id}:`, error);
                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Successfully invited ${successCount} of ${topCandidates.length} top candidates`,
            results,
        });

    } catch (error) {
        console.error('Error in batch invite:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to batch invite' },
            { status: 500 }
        );
    }
}
