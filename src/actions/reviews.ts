'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import { createReview, updateReview, deleteReview } from '@/services/review';
import { ActionResponse } from '@/types';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/services/notification';
import prisma from '@/lib/prisma';

const reviewSchema = z.object({
  locationId: z.string().min(1),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "Review must be at least 10 characters long").max(1000),
});

export async function submitReviewAction(data: z.infer<typeof reviewSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = reviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await createReview(session.user.id, parsed.data.locationId, parsed.data.rating, parsed.data.content);
    
    // Notify location contributor
    const location = await prisma.location.findUnique({
      where: { id: parsed.data.locationId },
      select: { userId: true },
    });
    
    if (location && location.userId !== session.user.id) {
      await createNotification({
        type: 'COMMENT',
        title: 'New Review',
        message: 'Someone reviewed a location you contributed.',
        userId: location.userId,
        actorId: session.user.id,
        locationId: parsed.data.locationId,
      });
    }

    revalidatePath(`/location/[slug]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const updateReviewSchema = z.object({
  reviewId: z.string().min(1),
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(1000),
});

export async function updateReviewAction(data: z.infer<typeof updateReviewSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = updateReviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await updateReview(session.user.id, parsed.data.reviewId, parsed.data.rating, parsed.data.content);
    revalidatePath(`/location/[slug]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const deleteReviewSchema = z.object({
  reviewId: z.string().min(1),
});

export async function deleteReviewAction(reviewId: string): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = deleteReviewSchema.safeParse({ reviewId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid review ID.' } };
    }

    const result = await deleteReview(session.user.id, parsed.data.reviewId);
    revalidatePath(`/location/[slug]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
