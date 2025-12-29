import { createClient } from '@/lib/supabase/server';

const RESUME_BUCKET = 'resumes';

/**
 * Upload a resume file to Supabase Storage
 * @param file - File buffer to upload
 * @param fileName - Name for the file
 * @param candidateId - Candidate's user ID for folder organization
 * @returns Public URL of the uploaded file
 */
export async function uploadResume(
    file: Buffer,
    fileName: string,
    candidateId: string
): Promise<string> {
    const supabase = await createClient();

    // Create unique file path: candidateId/timestamp-filename
    const timestamp = Date.now();
    const fileExt = fileName.split('.').pop();
    const filePath = `${candidateId}/${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(filePath, file, {
            contentType: getContentType(fileExt || ''),
            upsert: false,
        });

    if (error) {
        console.error('Resume upload error:', error);
        throw new Error(`Failed to upload resume: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(RESUME_BUCKET)
        .getPublicUrl(data.path);

    return publicUrl;
}

/**
 * Delete a resume file from Supabase Storage
 * @param filePath - Path to the file in storage (extracted from URL)
 */
export async function deleteResume(filePath: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from(RESUME_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error('Resume deletion error:', error);
        throw new Error(`Failed to delete resume: ${error.message}`);
    }
}

/**
 * Download a resume file from Supabase Storage
 * @param filePath - Path to the file in storage
 * @returns File buffer
 */
export async function downloadResume(filePath: string): Promise<Buffer> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from(RESUME_BUCKET)
        .download(filePath);

    if (error) {
        console.error('Resume download error:', error);
        throw new Error(`Failed to download resume: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
}

/**
 * Get the file path from a Supabase Storage URL
 */
export function getFilePathFromUrl(url: string): string {
    const parts = url.split(`/${RESUME_BUCKET}/`);
    return parts[1] || '';
}

/**
 * Get content type based on file extension
 */
function getContentType(ext: string): string {
    const types: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return types[ext.toLowerCase()] || 'application/octet-stream';
}
