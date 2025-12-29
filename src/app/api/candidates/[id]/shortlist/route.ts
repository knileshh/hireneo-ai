import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { candidates, interviews, assessmentTokens, interviewQuestions, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resendClient } from '@/lib/integrations/resend/client';
import { generateInterviewQuestions } from '@/lib/integrations/openai/questions';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/candidates/[id]/shortlist - Shortlist candidate and send assessment invite
 * Creates interview, generates questions, creates assessment token, and sends email
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const { id: candidateId } = await params;

        // Get candidate with job info
        const candidate = await db.query.candidates.findFirst({
            where: eq(candidates.id, candidateId),
            with: {
                job: true,
            },
        });

        if (!candidate) {
            return NextResponse.json(
                { error: 'Candidate not found' },
                { status: 404 }
            );
        }

        if (!candidate.job) {
            return NextResponse.json(
                { error: 'Job not found for candidate' },
                { status: 404 }
            );
        }

        if (candidate.status === 'INVITED') {
            return NextResponse.json(
                { error: 'Candidate already invited' },
                { status: 400 }
            );
        }

        // Create interview record
        const [interview] = await db.insert(interviews).values({
            jobId: candidate.jobId,
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            interviewerEmail: 'recruiter@hireneo.ai', // Default or could be passed in body
            scheduledAt: new Date(), // Immediate assessment
            status: 'SCHEDULED',
            jobRole: candidate.job.title,
            jobLevel: candidate.job.level || 'mid',
        }).returning();

        // Generate unbiased questions tailored to candidate's experience
        const questionsResult = await generateInterviewQuestions(
            candidate.job.title,
            candidate.job.level || 'mid',
            interview.id
        );

        // Save questions
        await db.insert(interviewQuestions).values({
            interviewId: interview.id,
            jobRole: candidate.job.title,
            jobLevel: candidate.job.level || 'mid',
            questions: questionsResult.questions,
        });

        // Create assessment token
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

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
            .where(eq(candidates.id, candidateId));

        // Build assessment URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const assessmentUrl = `${baseUrl}/assessment/${token}`;

        // Send email with assessment link
        try {
            await resendClient.sendAssessmentInvite({
                to: candidate.email,
                candidateName: candidate.name,
                jobTitle: candidate.job.title,
                assessmentUrl,
                expiresAt,
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the whole request if email fails
        }

        return NextResponse.json({
            success: true,
            message: `Assessment invite sent to ${candidate.email}`,
            assessmentUrl,
            interview: {
                id: interview.id,
                status: interview.status,
            },
        });

    } catch (error) {
        console.error('Error shortlisting candidate:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to shortlist candidate' },
            { status: 500 }
        );
    }
}
