import mammoth from 'mammoth';

/**
 * Extract text from a PDF file
 * Uses dynamic import for pdf-parse to handle module issues
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // Dynamic import for pdf-parse
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(buffer);
        return data.text || '';
    } catch (error: any) {
        console.error('PDF parsing error details:', {
            name: error?.name,
            message: error?.message,
            code: error?.code,
        });
        // Return empty string instead of throwing - let the app continue
        return '';
    }
}

/**
 * Extract text from a DOCX file
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error('Failed to extract text from DOCX');
    }
}

/**
 * Extract text from a file based on its extension
 */
export async function extractTextFromFile(
    buffer: Buffer,
    fileName: string
): Promise<string> {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf':
            return extractTextFromPdf(buffer);
        case 'docx':
            return extractTextFromDocx(buffer);
        case 'doc':
            // mammoth also handles .doc files
            return extractTextFromDocx(buffer);
        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }
}

/**
 * Validate file type (must be PDF, DOC, or DOCX)
 */
export function validateResumeFile(fileName: string, fileSize: number): {
    valid: boolean;
    error?: string;
} {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

    // Check file size
    if (fileSize > MAX_SIZE) {
        return {
            valid: false,
            error: 'File size must be less than 5MB',
        };
    }

    // Check file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: 'File must be PDF, DOC, or DOCX',
        };
    }

    return { valid: true };
}
