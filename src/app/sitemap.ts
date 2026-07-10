import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://localatlas.com';
  
  // Try to fetch dynamic paths safely for build
  let locations: any[] = [];
  let stories: any[] = [];
  try {
    locations = await prisma.location.findMany({ select: { slug: true, updatedAt: true }, take: 1000 });
    stories = await prisma.story.findMany({ where: { published: true }, select: { id: true, updatedAt: true }, take: 1000 });
  } catch (error) {
    console.error('Failed to fetch data for sitemap during build', error);
  }

  const locationUrls = locations.map((loc) => ({
    url: `${baseUrl}/location/${loc.slug}`,
    lastModified: loc.updatedAt,
    changeFrequency: 'weekly' as any,
    priority: 0.8,
  }));

  const storyUrls = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.id}`,
    lastModified: story.updatedAt,
    changeFrequency: 'weekly' as any,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...locationUrls,
    ...storyUrls,
  ];
}
