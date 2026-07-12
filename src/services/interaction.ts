import prisma from '@/lib/prisma';
import { createNotification } from './notification';
import { recalculateUserReputation } from './reputation';

export async function toggleSavePlace(userId: string, locationId: string) {
  const existingSave = await prisma.savedPlace.findFirst({
    where: { userId, locationId },
  });

  let saved = false;

  if (existingSave) {
    await prisma.savedPlace.delete({
      where: { id: existingSave.id },
    });
    saved = false;
  } else {
    await prisma.savedPlace.create({
      data: { userId, locationId },
    });
    saved = true;
  }

  // Recalculate contributor's reputation
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { userId: true }
  });
  if (location?.userId) {
    await recalculateUserReputation(location.userId);
  }

  return { saved };
}

export async function toggleLikeStory(userId: string, storyId: string) {
  const existingLike = await prisma.like.findFirst({
    where: { userId, storyId },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    return { liked: false };
  } else {
    await prisma.$transaction(async (tx) => {
      const like = await tx.like.create({
        data: { userId, storyId },
        include: { story: true },
      });
      
      if (like.story?.userId && like.story.userId !== userId) {
        await tx.notification.create({
          data: {
            type: 'LIKE',
            title: 'New Like',
            message: 'Someone liked your story.',
            userId: like.story.userId,
            actorId: userId,
          }
        });
      }
    });

    return { liked: true };
  }
}

export async function toggleFollowUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error("Cannot follow yourself");

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    await recalculateUserReputation(followingId);
    return { following: false };
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.follow.create({
        data: { followerId, followingId },
      });

      await tx.notification.create({
        data: {
          type: 'FOLLOW',
          title: 'New Follower',
          message: 'Someone started following you.',
          userId: followingId,
          actorId: followerId,
        }
      });
    });

    await recalculateUserReputation(followingId);
    return { following: true };
  }
}
