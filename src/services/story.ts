import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getStories = unstable_cache(async (limit?: number) => {
  try {
    const stories = await prisma.story.findMany({
      take: limit,
      where: { published: true },
      include: {
        user: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return stories;
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return [];
  }
}, ['stories'], { revalidate: 3600, tags: ['stories'] });

export const getStoryById = unstable_cache(async (id: string) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        user: true,
        location: true,
      }
    });
    return story;
  } catch (error) {
    console.error('Failed to fetch story:', error);
    return null;
  }
}, ['story-by-id'], { revalidate: 3600, tags: ['story'] });
