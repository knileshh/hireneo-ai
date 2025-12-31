import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { candidates, jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { scoreCandidate } from '@/lib/integrations/ai/resume-parser';
import { logger } from '@/lib/logger';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/jobs/[id]/candidates/rank - AI rank all candidates for a job
 * Re-scores all candidates against job requirements
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;

        // Get job with requirements
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Get all candidates for this job
        const jobCandidates = await db.query.candidates.findMany({
            where: eq(candidates.jobId, jobId),
        });

        if (jobCandidates.length === 0) {
            return NextResponse.json(
                { error: 'No candidates to rank' },
                { status: 400 }
            );
        }

        // Score each candidate
        const results = [];
        for (const candidate of jobCandidates) {
            if (!candidate.parsedResume) {
                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    error: 'No parsed resume data',
                });
                continue;
            }

            try {
                const matchAnalysis = await scoreCandidate(
                    candidate.parsedResume,
                    job.title,
                    job.requirements || [],
                    job.level || 'mid'
                );

                // Update candidate with new score
                await db.update(candidates)
                    .set({
                        matchScore: matchAnalysis.matchScore,
                        matchAnalysis: {
                            strengths: matchAnalysis.strengths,
                            gaps: matchAnalysis.gaps,
                            recommendation: matchAnalysis.recommendation,
                        },
                        updatedAt: new Date(),
                    })
                    .where(eq(candidates.id, candidate.id));

                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    matchScore: matchAnalysis.matchScore,
                    recommendation: matchAnalysis.recommendation,
                });
            } catch (error) {
                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    error: error instanceof Error ? error.message : 'Scoring failed',
                });
            }
        }

        // Get updated candidates sorted by score
        const rankedCandidates = await db.query.candidates.findMany({
            where: eq(candidates.jobId, jobId),
            orderBy: (c, { desc }) => [desc(c.matchScore)],
        });

        return NextResponse.json({
            message: `Ranked ${results.filter(r => !r.error).length} of ${results.length} candidates`,
            results,
            candidates: rankedCandidates,
        });

    } catch (error) {
        logger.error({ err: error }, 'Failed to rank candidates');
        return NextResponse.json(
            { error: 'Failed to rank candidates' },
            { status: 500 }
        );
    }
}
