'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import { toggleSavePlace, toggleFollowUser, toggleLikeStory } from '@/services/interaction';
import { ActionResponse } from '@/types';
import { revalidatePath } from 'next/cache';

const savePlaceSchema = z.object({
  locationId: z.string().min(1),
});

export async function toggleSaveAction(locationId: string): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = savePlaceSchema.safeParse({ locationId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid location ID.' } };
    }

    const result = await toggleSavePlace(session.user.id, parsed.data.locationId);
    revalidatePath('/saved');
    revalidatePath(`/location/[slug]`, 'page');
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const likeStorySchema = z.object({
  storyId: z.string().min(1),
});

export async function toggleLikeStoryAction(storyId: string): Promise<ActionResponse<{ liked: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = likeStorySchema.safeParse({ storyId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid story ID.' } };
    }

    const result = await toggleLikeStory(session.user.id, parsed.data.storyId);
    revalidatePath('/stories');
    revalidatePath(`/stories/[id]`, 'page');
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const followUserSchema = z.object({
  followingId: z.string().min(1),
});

export async function toggleFollowUserAction(followingId: string): Promise<ActionResponse<{ following: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = followUserSchema.safeParse({ followingId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid user ID.' } };
    }

    const result = await toggleFollowUser(session.user.id, parsed.data.followingId);
    revalidatePath('/profile');
    revalidatePath(`/profile/[id]`, 'page');
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
