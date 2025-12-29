import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/jobs - List all jobs
 */
export async function GET() {
    try {
        const allJobs = await db.query.jobs.findMany({
            orderBy: [desc(jobs.createdAt)],
            with: {
                candidates: true,
            },
        });

        // Add candidate counts
        const jobsWithCounts = allJobs.map(job => ({
            ...job,
            candidateCount: job.candidates?.length || 0,
            candidates: undefined, // Don't send full candidate list
        }));

        return NextResponse.json({ jobs: jobsWithCounts });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/jobs - Create a new job
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { title, description, requirements, level, department } = body;

        if (!title) {
            return NextResponse.json(
                { error: 'Job title is required' },
                { status: 400 }
            );
        }

        const [newJob] = await db.insert(jobs).values({
            title,
            description: description || null,
            requirements: requirements || [],
            level: level || null,
            department: department || null,
        }).returning();

        return NextResponse.json({ job: newJob }, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json(
            { error: 'Failed to create job' },
            { status: 500 }
        );
    }
}
