'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types';
import { PostCategory } from '@prisma/client';

// Schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  imageUrls: z.array(z.string()).optional().default([]),
  category: z.enum([
    'PLACE_RECOMMENDATION', 'QUESTION', 'PHOTO', 'TRAVEL_TIP', 
    'ALERT', 'FESTIVAL', 'ROUTE_UPDATE', 'FOOD', 'HERITAGE', 'MEETUP'
  ]).default('QUESTION'),
  locationId: z.string().optional(),
  pollOptions: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
});

const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, 'Comment is required').max(5000),
  parentId: z.string().optional(),
});

const toggleLikeSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
});

const toggleSavePostSchema = z.object({
  postId: z.string().min(1),
});

const voteOnPollSchema = z.object({
  pollId: z.string().min(1),
  optionId: z.string().min(1),
});

export async function searchLocationsAction(query: string) {
  if (!query || query.length < 2) return { success: true, data: [] };
  try {
    const locations = await prisma.location.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        status: { in: ['APPROVED', 'PENDING'] },
      },
      take: 5,
      select: { id: true, name: true, district: true, slug: true },
    });
    return { success: true, data: locations };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

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

    const { title, content, imageUrls, category, locationId, pollOptions } = parsed.data;

    // Optional: Validate location exists if provided
    if (locationId) {
      const loc = await prisma.location.findUnique({ where: { id: locationId } });
      if (!loc) {
        return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid location selected' } };
      }
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        imageUrls,
        category,
        locationId: locationId || null,
        userId: session.user.id,
        ...(pollOptions && pollOptions.length >= 2 ? {
          poll: {
            create: {
              options: {
                create: pollOptions.map(opt => ({ text: opt }))
              }
            }
          }
        } : {})
      },
    });

    revalidatePath('/community');
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function toggleSavePostAction(data: z.infer<typeof toggleSavePostSchema>): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = toggleSavePostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid ID' } };
    }

    const { postId } = parsed.data;

    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    if (existingSave) {
      await prisma.savedPost.delete({ where: { id: existingSave.id } });
      revalidatePath('/community');
      revalidatePath('/profile');
      return { success: true, data: { saved: false } };
    } else {
      await prisma.savedPost.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      });
      revalidatePath('/community');
      revalidatePath('/profile');
      return { success: true, data: { saved: true } };
    }
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function voteOnPollAction(data: z.infer<typeof voteOnPollSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } };
    }

    const parsed = voteOnPollSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } };
    }

    const { pollId, optionId } = parsed.data;

    // Ensure user hasn't voted already
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        userId_pollId: {
          userId: session.user.id,
          pollId: pollId,
        }
      }
    });

    if (existingVote) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You have already voted on this poll' } };
    }

    await prisma.pollVote.create({
      data: {
        userId: session.user.id,
        pollId: pollId,
        optionId: optionId,
      }
    });

    revalidatePath('/community');
    return { success: true, data: null };
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
        likes: false,
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

export async function fetchCommunityPosts(cursor?: string, limit: number = 10, category?: PostCategory) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const posts = await prisma.communityPost.findMany({
      where: category ? { category } : undefined,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        location: { select: { id: true, name: true, slug: true, district: true } },
        _count: { select: { likes: true, comments: true } },
        likes: userId ? {
          where: { userId },
          select: { id: true, userId: true },
        } : false,
        savedBy: userId ? {
          where: { userId },
          select: { id: true }
        } : false,
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
                votes: userId ? { where: { userId }, select: { id: true, optionId: true } } : false
              }
            },
            _count: { select: { votes: true } }
          }
        }
      },
    });
    
    let nextCursor: typeof cursor | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    return { posts, nextCursor };
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return { posts: [], nextCursor: undefined };
  }
}

export async function fetchTrendingPlacesAction() {
  try {
    // Get top locations based on community post count
    const locations = await prisma.location.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { communityPosts: true }
        }
      },
      orderBy: {
        communityPosts: {
          _count: 'desc'
        }
      },
      take: 5
    });
    
    return { success: true, data: locations.filter(l => l._count.communityPosts > 0) };
  } catch (error: any) {
    return { success: false, error: { message: error.message } };
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
  category: z.enum([
    'PLACE_RECOMMENDATION', 'QUESTION', 'PHOTO', 'TRAVEL_TIP', 
    'ALERT', 'FESTIVAL', 'ROUTE_UPDATE', 'FOOD', 'HERITAGE', 'MEETUP'
  ]).optional(),
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
        ...(parsed.data.category !== undefined && { category: parsed.data.category }),
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

    await prisma.comment.delete({
      where: { id: parsed.data.commentId },
    });

    revalidatePath('/community');
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
