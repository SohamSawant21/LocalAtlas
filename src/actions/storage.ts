'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import { generatePresignedUrl } from '@/services/storage';
import { ActionResponse } from '@/types';

const uploadRequestSchema = z.object({
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  folder: z.string().optional(),
});

export async function getPresignedUrlAction(
  data: z.infer<typeof uploadRequestSchema>
): Promise<ActionResponse<{ presignedUrl: string; publicUrl: string; fileName: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in to upload files.' } };
    }

    const parsed = uploadRequestSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid file metadata.' } };
    }

    const result = await generatePresignedUrl(parsed.data.fileType, parsed.data.fileSize, parsed.data.folder);
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
