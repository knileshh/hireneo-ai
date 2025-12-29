import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedResumeUrl } from '@/lib/supabase/storage';

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the file path from query params
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }

        // Generate signed URL
        const signedUrl = await getSignedResumeUrl(filePath);

        return NextResponse.json({ url: signedUrl });
    } catch (error: any) {
        console.error('Resume view error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get resume URL' },
            { status: 500 }
        );
    }
}
