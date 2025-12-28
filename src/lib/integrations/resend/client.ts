import { Resend } from 'resend';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Custom error class for Resend-specific errors
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

interface SendInterviewConfirmationParams {
  to: string;
  candidateName: string;
  interviewerEmail: string;
  scheduledAt: Date;
  meetingLink?: string;
}

/**
 * Resend client wrapper with error handling and templating
 */
export const resendClient = {
  /**
   * Send interview confirmation email to candidate
   */
  async sendInterviewConfirmation(params: SendInterviewConfirmationParams) {
    const { to, candidateName, interviewerEmail, scheduledAt, meetingLink } = params;

    logger.info({
      to,
      candidateName,
      scheduledAt: scheduledAt.toISOString(),
    }, 'Sending interview confirmation email');

    try {
      // Use verified domain for sending emails
      const fromAddress = 'HireNeo AI <noreply@mail.knileshh.com>';

      const result = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: `Interview Scheduled - ${scheduledAt.toLocaleDateString()}`,
        html: generateInterviewEmailHtml({
          candidateName,
          interviewerEmail,
          scheduledAt,
          meetingLink,
        }),
      });

      if (result.error) {
        throw new ResendError(
          result.error.message,
          undefined,
          result.error
        );
      }

      logger.info({
        emailId: result.data?.id,
        to,
      }, 'Interview confirmation email sent successfully');

      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        to,
        candidateName,
        error: errorMessage,
      }, 'Failed to send interview confirmation email');

      // Handle specific Resend errors
      if (error instanceof ResendError) {
        throw error;
      }

      // Check for rate limiting
      if (errorMessage.includes('rate limit')) {
        throw new ResendError(
          'Email rate limit exceeded. Please try again later.',
          429,
          error
        );
      }

      // Check for invalid API key
      if (errorMessage.includes('API key')) {
        throw new ResendError(
          'Invalid Resend API key. Please check your configuration.',
          401,
          error
        );
      }

      throw new ResendError(
        `Failed to send email: ${errorMessage}`,
        500,
        error
      );
    }
  },
};

/**
 * Generate HTML template for interview confirmation email
 */
function generateInterviewEmailHtml(params: {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Scheduled</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FAFAF9;">
        <div style="background: #1A3305; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <img src="https://hireneo.ai/logo.png" alt="HireNeo AI" width="48" height="48" style="border-radius: 8px; margin-bottom: 12px;" />
          <h1 style="color: white; margin: 0; font-size: 24px;">Interview Scheduled</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello ${candidateName},</p>
          <p style="font-size: 16px; color: #334155;">Your interview has been scheduled!</p>
          
          <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1A3305/20;">
            <p style="margin: 0 0 10px 0; color: #1A3305; font-size: 14px; font-weight: 600;">📅 Date & Time</p>
            <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">
              ${scheduledAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} at ${scheduledAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">Interviewer</p>
            <p style="margin: 0; color: #0f172a; font-size: 16px;">${interviewerEmail}</p>
          </div>
          
          ${meetingLink ? `
          <a href="${meetingLink}" style="display: inline-block; background: #1A3305; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">
            Join Meeting
          </a>
          ` : ''}
          
          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If you have any questions, please reach out to your interviewer at ${interviewerEmail}.
          </p>
          
          <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            Sent by <strong style="color: #1A3305;">HireNeo AI</strong>
          </p>
        </div>
      </body>
    </html>
  `;
}
