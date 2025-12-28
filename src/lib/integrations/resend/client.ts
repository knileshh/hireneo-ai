import { Resend } from 'resend';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Custom error class for Resend-specific failures
 */
export class ResendError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'ResendError';
    }
}

/**
 * Resend client wrapper with error handling and logging
 */
export class ResendClient {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(env.RESEND_API_KEY);
    }

    /**
     * Send interview confirmation email
     */
    async sendInterviewConfirmation(params: {
        to: string;
        candidateName: string;
        interviewerEmail: string;
        scheduledAt: Date;
        meetingLink?: string;
    }) {
        const { to, candidateName, interviewerEmail, scheduledAt, meetingLink } = params;

        try {
            logger.info('Sending interview confirmation email', {
                to,
                candidateName,
                scheduledAt: scheduledAt.toISOString()
            });

            const result = await this.resend.emails.send({
                from: 'HireNeo AI <interviews@hireneo.ai>',
                to,
                subject: `Interview Scheduled - ${scheduledAt.toLocaleDateString()}`,
                html: this.generateConfirmationEmail({
                    candidateName,
                    interviewerEmail,
                    scheduledAt,
                    meetingLink
                })
            });

            logger.info('Interview confirmation email sent successfully', {
                emailId: result.data?.id,
                to
            });

            return result;

        } catch (error: any) {
            // Map Resend errors to internal error types
            if (error.statusCode === 429) {
                logger.error('Resend rate limit exceeded', { to });
                throw new ResendError('Rate limit exceeded', 429, error);
            }

            if (error.statusCode === 401 || error.statusCode === 403) {
                logger.error('Resend authentication failed - check API key');
                throw new ResendError('Authentication failed', error.statusCode, error);
            }

            logger.error('Failed to send interview confirmation email', {
                error: error.message,
                to,
                statusCode: error.statusCode
            });

            throw new ResendError(
                `Email send failed: ${error.message}`,
                error.statusCode,
                error
            );
        }
    }

    /**
     * Generate HTML email template for interview confirmation
     */
    private generateConfirmationEmail(params: {
        candidateName: string;
        interviewerEmail: string;
        scheduledAt: Date;
        meetingLink?: string;
    }): string {
        const { candidateName, interviewerEmail, scheduledAt, meetingLink } = params;

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${candidateName},</p>
              <p>Your interview has been successfully scheduled!</p>
              
              <div class="details">
                <h3>Interview Details</h3>
                <p><strong>Date & Time:</strong> ${scheduledAt.toLocaleString()}</p>
                <p><strong>Interviewer:</strong> ${interviewerEmail}</p>
                ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
              </div>
              
              <p>We're looking forward to speaking with you!</p>
              
              ${meetingLink ? `<a href="${meetingLink}" class="button">Join Meeting</a>` : ''}
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Best regards,<br>
                The HireNeo AI Team
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
}

// Export singleton instance
export const resendClient = new ResendClient();
