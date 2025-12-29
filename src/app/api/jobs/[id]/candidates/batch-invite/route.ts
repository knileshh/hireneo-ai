import { NextResponse } from 'next/server';
import { InterviewService } from '@/lib/services/interview.service';
import { logger } from '@/lib/logger';

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

        const result = await InterviewService.inviteTopCandidates(jobId, count);

        if (result.candidatesFound === 0) {
            return NextResponse.json(
                { error: 'No eligible candidates to invite' },
                { status: 400 }
            );
        }

        const successCount = result.results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Successfully invited ${successCount} of ${result.candidatesFound} top candidates`,
            results: result.results,
        });

    } catch (error) {
        logger.error({ error, jobId: (await params).id }, 'Error in batch invite API');
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to batch invite' },
            { status: 500 }
        );
    }
}
