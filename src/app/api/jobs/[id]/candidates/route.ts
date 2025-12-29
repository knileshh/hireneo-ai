import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { candidates, jobs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { parseResume, scoreCandidate } from '@/lib/integrations/ai/resume-parser';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/jobs/[id]/candidates - List candidates for a job
 */
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;

        const jobCandidates = await db.query.candidates.findMany({
            where: eq(candidates.jobId, jobId),
            orderBy: [desc(candidates.matchScore)],
        });

        return NextResponse.json({ candidates: jobCandidates });
    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/jobs/[id]/candidates - Upload resume and create candidate
 * Accepts either:
 * - multipart/form-data with resume file
 * - application/json with resumeText field
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const { id: jobId } = await params;

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

        let resumeText: string;
        let resumeUrl: string | null = null;

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await req.formData();
            const file = formData.get('resume') as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: 'Resume file is required' },
                    { status: 400 }
                );
            }

            // Save file to local storage
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
            await mkdir(uploadsDir, { recursive: true });

            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = path.join(uploadsDir, fileName);

            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(filePath, buffer);

            resumeUrl = `/uploads/resumes/${fileName}`;

            // For now, we'll extract text from the file (simple approach)
            // In production, use pdf-parse
            resumeText = buffer.toString('utf-8');

            // If it looks like PDF binary, ask for text
            if (resumeText.startsWith('%PDF')) {
                // Try to extract at least some text from PDF
                resumeText = buffer.toString('latin1')
                    .replace(/[^\x20-\x7E\n\r]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
        } else {
            // Handle JSON with resume text
            const body = await req.json();
            resumeText = body.resumeText;

            if (!resumeText) {
                return NextResponse.json(
                    { error: 'Resume text is required' },
                    { status: 400 }
                );
            }
        }

        // Parse resume using AI
        const parsedResume = await parseResume(resumeText);

        // Score candidate against job requirements
        const matchAnalysis = await scoreCandidate(
            parsedResume,
            job.title,
            job.requirements || [],
            job.level || 'mid'
        );

        // Create candidate record
        const [newCandidate] = await db.insert(candidates).values({
            jobId,
            name: parsedResume.name,
            email: parsedResume.email,
            phone: parsedResume.phone || null,
            resumeUrl,
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
            candidate: newCandidate,
            analysis: matchAnalysis,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating candidate:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create candidate' },
            { status: 500 }
        );
    }
}
