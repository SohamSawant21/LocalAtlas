import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getTopGuides = unstable_cache(async (limit = 4) => {
  try {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { reputation: 'desc' },
      include: {
        _count: {
          select: { locations: true, followers: true, following: true, savedPlaces: true }
        }
      }
    });
    return users;
  } catch (error) {
    console.error('Failed to fetch top guides:', error);
    return [];
  }
}, ['top-guides'], { revalidate: 3600, tags: ['users'] });

export const getUserProfile = unstable_cache(async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        locations: true,
        stories: true,
        savedPlaces: { include: { location: true } },
        userBadges: { include: { badge: true } },
        _count: {
          select: { followers: true, following: true, savedPlaces: true, locations: true }
        }
      }
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}, ['user-profile'], { revalidate: 3600, tags: ['user'] });

export const getIsFollowing = async (followerId: string, followingId: string) => {
  if (!followerId || !followingId) return false;
  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });
    return !!follow;
  } catch (error) {
    console.error('Failed to check follow status:', error);
    return false;
  }
};
