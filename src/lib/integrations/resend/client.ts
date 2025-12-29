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

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(params: {
    to: string;
    userName: string;
    userRole: 'candidate' | 'recruiter';
  }) {
    const { to, userName, userRole } = params;

    logger.info({
      to,
      userName,
      userRole,
    }, 'Sending welcome email');

    try {
      const fromAddress = 'HireNeo AI <noreply@mail.knileshh.com>';

      const result = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: 'Welcome to HireNeo AI - Let\'s Transform Your Hiring! 🚀',
        html: generateWelcomeEmailHtml({
          userName,
          userRole,
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
      }, 'Welcome email sent successfully');

      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        to,
        userName,
        error: errorMessage,
      }, 'Failed to send welcome email');

      if (error instanceof ResendError) {
        throw error;
      }

      throw new ResendError(
        `Failed to send welcome email: ${errorMessage}`,
        500,
        error
      );
    }
  },

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(params: {
    to: string;
    userName: string;
    userRole: 'candidate' | 'recruiter';
  }) {
    const { to, userName, userRole } = params;

    logger.info({
      to,
      userName,
      userRole,
    }, 'Sending welcome email');

    try {
      const fromAddress = 'HireNeo AI <noreply@mail.knileshh.com>';

      const result = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: 'Welcome to HireNeo AI - Let\'s Transform Your Hiring! 🚀',
        html: generateWelcomeEmailHtml({
          userName,
          userRole,
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
      }, 'Welcome email sent successfully');

      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        to,
        userName,
        error: errorMessage,
      }, 'Failed to send welcome email');

      if (error instanceof ResendError) {
        throw error;
      }

      throw new ResendError(
        `Failed to send welcome email: ${errorMessage}`,
        500,
        error
      );
    }
  },

  /**
   * Send assessment invite email to shortlisted candidate
   */
  async sendAssessmentInvite(params: {
    to: string;
    candidateName: string;
    jobTitle: string;
    assessmentUrl: string;
    expiresAt: Date;
  }) {
    const { to, candidateName, jobTitle, assessmentUrl, expiresAt } = params;

    logger.info({
      to,
      candidateName,
      jobTitle,
    }, 'Sending assessment invite email');

    try {
      const fromAddress = 'HireNeo AI <noreply@mail.knileshh.com>';

      const result = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: `Complete Your Assessment for ${jobTitle} - HireNeo AI`,
        html: generateAssessmentInviteHtml({
          candidateName,
          jobTitle,
          assessmentUrl,
          expiresAt,
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
      }, 'Assessment invite email sent successfully');

      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        to,
        candidateName,
        error: errorMessage,
      }, 'Failed to send assessment invite email');

      if (error instanceof ResendError) {
        throw error;
      }

      throw new ResendError(
        `Failed to send assessment invite: ${errorMessage}`,
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

/**
 * Generate HTML template for assessment invite email
 */
function generateAssessmentInviteHtml(params: {
  candidateName: string;
  jobTitle: string;
  assessmentUrl: string;
  expiresAt: Date;
}): string {
  const { candidateName, jobTitle, assessmentUrl, expiresAt } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Assessment</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FAFAF9;">
        <div style="background: #1A3305; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">You're Shortlisted! 🎉</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello ${candidateName},</p>
          <p style="font-size: 16px; color: #334155;">
            Great news! You've been shortlisted for the <strong>${jobTitle}</strong> position.
          </p>
          <p style="font-size: 16px; color: #334155;">
            Please complete your assessment to continue in the hiring process.
          </p>
          
          <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(26, 51, 5, 0.2);">
            <p style="margin: 0 0 10px 0; color: #1A3305; font-size: 14px; font-weight: 600;">📋 Assessment Details</p>
            <ul style="margin: 0; padding-left: 20px; color: #0f172a; font-size: 14px;">
              <li>8 questions covering personal, behavioral, and technical topics</li>
              <li>Each question has a time limit (2-4 minutes)</li>
              <li>You can type or record your answers</li>
              <li>Takes approximately 20-30 minutes</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${assessmentUrl}" style="display: inline-block; background: #1A3305; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Start Assessment →
            </a>
          </div>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #F59E0B;">
            <p style="margin: 0; color: #B45309; font-size: 14px;">
              ⏰ <strong>Expires:</strong> ${expiresAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
            </p>
          </div>

          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            Tips for a great assessment:
          </p>
          <ul style="font-size: 14px; color: #64748b; padding-left: 20px;">
            <li>Find a quiet space with a stable internet connection</li>
            <li>Have your resume nearby for reference</li>
            <li>Take your time to provide thoughtful answers</li>
          </ul>
          
          <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            Good luck! 🍀<br/>
            Sent by <strong style="color: #1A3305;">HireNeo AI</strong>
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate HTML template for welcome email
 */
function generateWelcomeEmailHtml(params: {
  userName: string;
  userRole: 'candidate' | 'recruiter';
}): string {
  const { userName, userRole } = params;

  const roleContent = userRole === 'recruiter' 
    ? {
        title: 'Welcome to HireNeo AI',
        subtitle: 'Transform your hiring process with AI-powered interviews',
        features: [
          '🎯 AI-Generated Interview Questions tailored to each role',
          '🎤 Automated Candidate Assessments with voice/text responses',
          '📊 Intelligent Scoring & Analytics to identify top talent',
          '⚡ Streamlined Workflow from job posting to final evaluation',
          '🔔 Smart Reminders & Notifications for you and candidates',
        ],
        cta: 'Create Your First Job',
        ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/jobs`,
      }
    : {
        title: 'Welcome to HireNeo AI',
        subtitle: 'Get ready for a smarter interview experience',
        features: [
          '🎯 Personalized interview questions matched to your skills',
          '🎤 Flexible response options - type or record your answers',
          '📊 Instant feedback and detailed performance insights',
          '⚡ Quick 20-30 minute assessments that fit your schedule',
          '🔔 Timely notifications to keep you in the loop',
        ],
        cta: 'View Opportunities',
        ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/jobs`,
      };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${roleContent.title}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FAFAF9;">
        <div style="background: linear-gradient(135deg, #1A3305 0%, #2D5A0A 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="width: 64px; height: 64px; background: white; border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🚀</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${roleContent.title}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${roleContent.subtitle}</p>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; color: #334155; margin-top: 0;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #334155;">Welcome to <strong style="color: #1A3305;">HireNeo AI</strong>! 🎉 We're excited to have you on board.</p>
          
          <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
            ${userRole === 'recruiter' 
              ? 'You\'re all set to revolutionize your hiring process. Here\'s what you can do with HireNeo AI:'
              : 'You\'re all set to showcase your skills through our intelligent interview platform. Here\'s what makes HireNeo AI special:'}
          </p>

          <div style="background: #ECFDF5; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(26, 51, 5, 0.1);">
            ${roleContent.features.map(feature => `
              <div style="margin-bottom: 12px; color: #0f172a; font-size: 15px; line-height: 1.6;">${feature}</div>
            `).join('')}
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${roleContent.ctaUrl}" style="display: inline-block; background: #1A3305; color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(26, 51, 5, 0.2);">
              ${roleContent.cta} →
            </a>
          </div>

          ${userRole === 'recruiter' ? `
          <div style="background: #FEF3C7; padding: 20px; border-radius: 10px; margin: 24px 0; border: 1px solid #F59E0B;">
            <p style="margin: 0; color: #B45309; font-size: 14px; line-height: 1.6;">
              💡 <strong>Pro Tip:</strong> Start by creating a job posting, and let our AI generate customized interview questions. Your candidates will receive assessment links automatically!
            </p>
          </div>
          ` : `
          <div style="background: #EFF6FF; padding: 20px; border-radius: 10px; margin: 24px 0; border: 1px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF; font-size: 14px; line-height: 1.6;">
              💡 <strong>Pro Tip:</strong> When you receive an assessment invitation, find a quiet space and take your time to provide thoughtful answers. You've got this!
            </p>
          </div>
          `}

          <p style="font-size: 14px; color: #64748b; margin-top: 32px;">
            Need help getting started? Check out our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/docs" style="color: #1A3305; text-decoration: underline;">documentation</a> or reply to this email.
          </p>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #94a3b8; margin: 0;">
              Happy ${userRole === 'recruiter' ? 'hiring' : 'interviewing'}! 🌟<br/>
              The <strong style="color: #1A3305;">HireNeo AI</strong> Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
