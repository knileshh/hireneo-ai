import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadResume } from '@/lib/supabase/storage';
import { extractTextFromFile } from '@/lib/utils/file-parser';
import { parseResumeWithAI } from '@/lib/integrations/openai/resume-parser';
import { db } from '@/lib/db';
import { candidateProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File must be PDF, DOC, or DOCX' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Supabase Storage
        const resumeUrl = await uploadResume(buffer, file.name, user.id);

        // Extract text from file
        const resumeText = await extractTextFromFile(buffer, file.name);

        // Parse with AI
        const parsedResume = await parseResumeWithAI(resumeText);

        // Save or update candidate profile
        const existingProfile = await db.query.candidateProfiles.findFirst({
            where: eq(candidateProfiles.userId, user.id),
        });

        if (existingProfile) {
            // Update existing profile
            await db.update(candidateProfiles)
                .set({
                    resumeUrl,
                    parsedResume,
                    updatedAt: new Date(),
                })
                .where(eq(candidateProfiles.userId, user.id));
        } else {
            // Create new profile
            await db.insert(candidateProfiles).values({
                userId: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email!,
                resumeUrl,
                parsedResume,
            });
        }

        return NextResponse.json({
            success: true,
            resumeUrl,
            parsedResume,
        });
    } catch (error: any) {
        console.error('Resume upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload resume' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get candidate profile
        const profile = await db.query.candidateProfiles.findFirst({
            where: eq(candidateProfiles.userId, user.id),
        });

        if (!profile) {
            return NextResponse.json(
                { profile: null },
                { status: 200 }
            );
        }

        return NextResponse.json({
            profile: {
                resumeUrl: profile.resumeUrl,
                parsedResume: profile.parsedResume,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
            },
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get profile' },
            { status: 500 }
        );
    }
}
