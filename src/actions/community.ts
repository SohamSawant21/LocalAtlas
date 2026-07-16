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
  imageUrls: z.array(z.string()).optional().default([]),
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
        imageUrls: parsed.data.imageUrls,
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
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true } },
        likes: false, // newly created comment has no likes
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

export async function fetchCommunityPosts(cursor?: string, limit: number = 10) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const posts = await prisma.communityPost.findMany({
      take: limit + 1, // to check if there's a next page
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true, userId: true },
        } : false,
      },
    });
    
    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop(); // remove the extra item
      nextCursor = nextItem?.id;
    }

    return { posts, nextCursor };
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return { posts: [], nextCursor: undefined };
  }
}

export async function fetchPostCommentsAction(postId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true } },
        likes: userId ? {
          where: { userId },
          select: { id: true, userId: true },
        } : false,
      },
    });
    return { success: true, data: comments };
  } catch (error: any) {
    return { success: false, error: { message: error.message } };
  }
}

const updatePostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long').optional(),
  imageUrls: z.array(z.string()).optional(),
});

export async function updateCommunityPostAction(data: z.infer<typeof updatePostSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = updatePostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.errors[0].message } };
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: parsed.data.postId },
    });

    if (!post) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } };
    }

    if (post.userId !== session.user.id) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You can only edit your own posts' } };
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: parsed.data.postId },
      data: {
        ...(parsed.data.title && { title: parsed.data.title }),
        ...(parsed.data.content && { content: parsed.data.content }),
        ...(parsed.data.imageUrls !== undefined && { imageUrls: parsed.data.imageUrls }),
      },
    });

    revalidatePath('/community');
    return { success: true, data: updatedPost };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const deletePostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
});

export async function deleteCommunityPostAction(data: z.infer<typeof deletePostSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = deletePostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.errors[0].message } };
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: parsed.data.postId },
    });

    if (!post) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } };
    }

    if (post.userId !== session.user.id) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You can only delete your own posts' } };
    }

    // Prisma's onDelete: Cascade handles likes and comments automatically


    await prisma.communityPost.delete({
      where: { id: parsed.data.postId },
    });

    revalidatePath('/community');
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const deleteCommentSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
});

export async function deleteCommunityCommentAction(data: z.infer<typeof deleteCommentSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = deleteCommentSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.errors[0].message } };
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parsed.data.commentId },
    });

    if (!comment) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Comment not found' } };
    }

    if (comment.userId !== session.user.id) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You can only delete your own comments' } };
    }

    // Prisma's onDelete: Cascade handles nested likes and replies automatically


    await prisma.comment.delete({
      where: { id: parsed.data.commentId },
    });

    revalidatePath('/community');
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
