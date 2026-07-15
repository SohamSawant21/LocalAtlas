'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types';

// Schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  imageUrl: z.string().optional(),
});

const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, 'Comment is required').max(5000),
  parentId: z.string().optional(), // For threaded replies
});

const toggleLikeSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
});

export async function createCommunityPostAction(data: z.infer<typeof createPostSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = createPostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.errors[0].message } };
    }

    const post = await prisma.communityPost.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl,
        userId: session.user.id,
      },
    });

    revalidatePath('/community');
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function createCommunityCommentAction(data: z.infer<typeof createCommentSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = createCommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.errors[0].message } };
    }

    const comment = await prisma.comment.create({
      data: {
        postId: parsed.data.postId,
        content: parsed.data.content,
        userId: session.user.id,
        parentId: parsed.data.parentId,
      },
    });

    revalidatePath('/community');
    return { success: true, data: comment };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function toggleCommunityLikeAction(data: z.infer<typeof toggleLikeSchema>): Promise<ActionResponse<{ liked: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = toggleLikeSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid ID' } };
    }

    const { postId, commentId } = parsed.data;
    if (!postId && !commentId) {
       return { success: false, error: { code: 'BAD_REQUEST', message: 'Must provide either postId or commentId' } };
    }

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId || undefined,
        commentId: commentId || undefined,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      revalidatePath('/community');
      return { success: true, data: { liked: false } };
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId || null,
          commentId: commentId || null,
        },
      });
      revalidatePath('/community');
      return { success: true, data: { liked: true } };
    }
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function fetchCommunityPosts() {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        likes: true,
        comments: {
           include: { user: true, likes: true }
        }
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
}
