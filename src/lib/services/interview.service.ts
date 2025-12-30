import { db } from '@/lib/db';
import { candidates, interviews, assessmentTokens, interviewQuestions, jobs } from '@/lib/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { resendClient } from '@/lib/integrations/resend/client';
import { generateInterviewQuestions } from '@/lib/integrations/openai/questions';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export class InterviewService {
    /**
     * Invite top N candidates for a job who haven't been invited yet
     */
    static async inviteTopCandidates(jobId: string, count: number = 3) {
        // Get job details
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
        });

        if (!job) {
            throw new Error('Job not found');
        }

        // Get top N candidates (not yet invited)
        const topCandidates = await db.query.candidates.findMany({
            where: and(
                eq(candidates.jobId, jobId),
                ne(candidates.status, 'INVITED')
            ),
            orderBy: [desc(candidates.matchScore)],
            limit: count,
        });

        if (topCandidates.length === 0) {
            return {
                candidatesFound: 0,
                results: [],
            };
        }

        const results = [];

        for (const candidate of topCandidates) {
            try {
                // 1. Create interview record
                const [interview] = await db.insert(interviews).values({
                    userId: job.userId,
                    jobId: candidate.jobId,
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    interviewerEmail: 'recruiter@hireneo-ai.xyz',
                    scheduledAt: new Date(),
                    status: 'SCHEDULED',
                    jobRole: job.title,
                    jobLevel: job.level || 'mid',
                }).returning();

                // 2. Generate questions using AI
                const questionsResult = await generateInterviewQuestions(
                    job.title,
                    job.level || 'mid',
                    interview.id
                );

                // 3. Save questions
                await db.insert(interviewQuestions).values({
                    interviewId: interview.id,
                    jobRole: job.title,
                    jobLevel: job.level || 'mid',
                    questions: questionsResult.questions,
                });

                // 4. Create assessment token
                const token = uuidv4();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

                await db.insert(assessmentTokens).values({
                    interviewId: interview.id,
                    token,
                    expiresAt,
                });

                // 5. Update candidate status
                await db.update(candidates)
                    .set({
                        status: 'INVITED',
                        interviewId: interview.id,
                        invitedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(candidates.id, candidate.id));

                // 6. Send invite email
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

                logger.info({ candidateId: candidate.id, jobId }, 'Successfully batched invited candidate');

            } catch (error) {
                logger.error({ candidateId: candidate.id, error }, 'Failed to batch invite candidate');
                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    email: candidate.email,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return {
            candidatesFound: topCandidates.length,
            results,
        };
    }
}
