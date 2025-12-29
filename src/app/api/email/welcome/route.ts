import { NextRequest, NextResponse } from 'next/server';
import { resendClient } from '@/lib/integrations/resend/client';

/**
 * POST /api/email/welcome - Send welcome email after signup
 */
export async function POST(request: NextRequest) {
    try {
        const { email, name, role } = await request.json();

        if (!email || !name || !role) {
            return NextResponse.json(
                { error: 'Email, name, and role are required' },
                { status: 400 }
            );
        }

        await resendClient.sendWelcomeEmail({
            to: email,
            userName: name,
            userRole: role as 'candidate' | 'recruiter',
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Welcome email error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send welcome email' },
            { status: 500 }
        );
    }
}
