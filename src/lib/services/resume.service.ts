import { db } from '@/lib/db';
import { candidateProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { uploadResume } from '@/lib/supabase/storage';
import { extractTextFromFile } from '@/lib/utils/file-parser';
import { parseResumeWithAI } from '@/lib/integrations/openai/resume-parser';
import { logger } from '@/lib/logger';

export class ResumeService {
    /**
     * Process, upload, and save a resume for a user
     */
    static async processAndSaveResume(
        userId: string,
        fileBuffer: Buffer,
        fileName: string,
        userEmail: string,
        userName?: string
    ) {
        // 1. Upload to Supabase Storage
        let resumeUrl: string;
        try {
            resumeUrl = await uploadResume(fileBuffer, fileName, userId);
        } catch (uploadError: any) {
            logger.error({ userId, error: uploadError }, 'Failed to upload resume to storage');
            throw new Error(`Storage error: ${uploadError.message}`);
        }

        // 2. Try to extract text and parse with AI (non-fatal)
        let parsedResume = null;
        try {
            const resumeText = await extractTextFromFile(fileBuffer, fileName);
            parsedResume = await parseResumeWithAI(resumeText);
        } catch (parseError) {
            logger.warn({ userId, error: parseError }, 'Resume parsing failed (non-fatal)');
            // Continue without parsed resume
        }

        // 3. Save or update candidate profile
        try {
            const existingProfile = await db.query.candidateProfiles.findFirst({
                where: eq(candidateProfiles.userId, userId),
            });

            if (existingProfile) {
                await db.update(candidateProfiles)
                    .set({
                        resumeUrl,
                        parsedResume,
                        updatedAt: new Date(),
                    })
                    .where(eq(candidateProfiles.userId, userId));
            } else {
                await db.insert(candidateProfiles).values({
                    userId,
                    name: userName || userEmail.split('@')[0] || 'User',
                    email: userEmail,
                    resumeUrl,
                    parsedResume,
                });
            }
        } catch (dbError: any) {
            logger.error({ userId, error: dbError }, 'Failed to save candidate profile');
            // Resume is uploaded, just profile save failed - we still return the URL
        }

        return {
            resumeUrl,
            parsedResume,
        };
    }

    /**
     * Get candidate profile for a user
     */
    static async getProfile(userId: string) {
        try {
            const profile = await db.query.candidateProfiles.findFirst({
                where: eq(candidateProfiles.userId, userId),
            });
            return profile;
        } catch (error) {
            logger.error({ userId, error }, 'Failed to get candidate profile');
            throw error;
        }
    }
}
