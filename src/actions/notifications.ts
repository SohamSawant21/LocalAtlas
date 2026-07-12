'use server';

import { auth } from '@/auth';
import { markNotificationAsRead } from '@/services/notification';
import { ActionResponse } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const markAsReadSchema = z.object({
  notificationId: z.string().min(1),
});

export async function markNotificationAsReadAction(notificationId: string): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = markAsReadSchema.safeParse({ notificationId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid notification ID.' } };
    }

    await markNotificationAsRead(session.user.id, parsed.data.notificationId);
    
    // We should revalidate the notifications path to keep UI in sync
    revalidatePath('/notifications');
    
    return { success: true, data: { success: true } };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    
    revalidatePath('/notifications');
    
    return { success: true, data: { success: true } };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
