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
        savedPosts: {
          include: {
            post: {
              include: {
                user: { select: { id: true, name: true, avatar: true } },
                location: { select: { id: true, name: true, slug: true, district: true } },
                _count: { select: { likes: true, comments: true } },
                likes: { where: { userId: id }, select: { id: true, userId: true } },
                savedBy: { where: { userId: id }, select: { id: true } },
                poll: {
                  include: {
                    options: {
                      include: {
                        _count: { select: { votes: true } },
                        votes: { where: { userId: id }, select: { id: true, optionId: true } }
                      }
                    },
                    _count: { select: { votes: true } }
                  }
                }
              }
            }
          }
        },
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
