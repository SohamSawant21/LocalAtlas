import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { recalculateUserReputation } from './reputation';

export const getRecentReviews = unstable_cache(async (limit = 10) => {
  try {
    const reviews = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        location: true,
      }
    });
    return reviews;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}, ['recent-reviews'], { revalidate: 3600, tags: ['reviews'] });

export async function createReview(userId: string, locationId: string, rating: number, content: string) {
  const existingReview = await prisma.review.findUnique({
    where: { userId_locationId: { userId, locationId } },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this location.');
  }

  const review = await prisma.review.create({
    data: {
      userId,
      locationId,
      rating,
      content,
    },
    include: { location: { select: { userId: true } } }
  });
  
  if (review.location?.userId) {
    await recalculateUserReputation(review.location.userId);
  }
  
  return review;
}

export async function updateReview(userId: string, reviewId: string, rating: number, content: string) {
  const review = await prisma.review.update({
    where: { id: reviewId, userId },
    data: { rating, content },
    include: { location: { select: { userId: true } } }
  });
  
  if (review.location?.userId) {
    await recalculateUserReputation(review.location.userId);
  }
  
  return review;
}

export async function deleteReview(userId: string, reviewId: string) {
  const review = await prisma.review.delete({
    where: { id: reviewId, userId },
    include: { location: { select: { userId: true } } }
  });
  
  if (review.location?.userId) {
    await recalculateUserReputation(review.location.userId);
  }
  
  return review;
}
