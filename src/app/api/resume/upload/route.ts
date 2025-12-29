import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResumeService } from '@/lib/services/resume.service';
import { logger } from '@/lib/logger';

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

        // Process with service
        const result = await ResumeService.processAndSaveResume(
            user.id,
            buffer,
            file.name,
            user.email!,
            user.user_metadata?.full_name
        );

        return NextResponse.json({
            success: true,
            resumeUrl: result.resumeUrl,
            parsedResume: result.parsedResume,
        });

    } catch (error: any) {
        logger.error({ error }, 'Resume upload error');
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

        const profile = await ResumeService.getProfile(user.id);

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
        logger.error({ error }, 'Get profile error');
        return NextResponse.json(
            { error: error.message || 'Failed to get profile' },
            { status: 500 }
        );
    }
}
