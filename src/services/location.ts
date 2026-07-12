import prisma from '@/lib/prisma';
import { LocationData } from '@/types';
import { LocationCategory, LocationStatus } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { recalculateUserReputation } from './reputation';

export const getLocations = unstable_cache(async (params?: { category?: string; limit?: number }) => {
  try {
    const locations = await prisma.location.findMany({
      take: params?.limit,
      where: params?.category ? { category: params.category as LocationCategory } : undefined,
      include: {
        contributor: true,
        photos: true,
        reviews: true,
      },
      orderBy: { hiddenScore: 'desc' },
    });
    return locations as unknown as LocationData[];
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return [];
  }
}, ['locations'], { revalidate: 3600, tags: ['locations'] });

export const getLocationBySlug = unstable_cache(async (slug: string) => {
  try {
    const location = await prisma.location.findUnique({
      where: { slug },
      include: {
        contributor: true,
        photos: true,
        reviews: {
          include: { user: true }
        },
      }
    });
    return location as unknown as LocationData | null;
  } catch (error) {
    console.error('Failed to fetch location:', error);
    return null;
  }
}, ['location-by-slug'], { revalidate: 3600, tags: ['location'] });

export async function createLocation(data: Omit<LocationData, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'verified' | 'verificationCount' | 'status'> & { slug: string, status?: LocationStatus }) {
  return prisma.location.create({
    data: {
      ...data,
      district: data.district,
      category: data.category,
      tags: data.tags,
      images: data.images,
      status: data.status || 'PENDING',
    } as any
  });
}

export async function updateLocationStatus(locationId: string, status: LocationStatus, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const loc = await tx.location.update({
      where: { id: locationId },
      data: { status },
      select: { userId: true, name: true }
    });

    if (status === 'APPROVED' && loc.userId) {
      await tx.notification.create({
        data: {
          type: 'APPROVAL',
          title: 'Contribution Approved',
          message: `Your contribution "${loc.name}" has been approved!`,
          userId: loc.userId,
          actorId,
          locationId,
        }
      });
    }

    if ((status === 'APPROVED' || status === 'REJECTED') && loc.userId) {
      await recalculateUserReputation(loc.userId, tx as any);
    }

    return loc;
  });
}
