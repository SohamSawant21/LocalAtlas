'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import { createLocation, updateLocationStatus, updateLocation } from '@/services/location';
import { ActionResponse } from '@/types';
import { revalidatePath, revalidateTag } from 'next/cache';
import { LocationStatus } from '@prisma/client';

const contributionSchema = z.object({
  name: z.string().min(3),
  district: z.enum(['SINDHUDURG', 'RATNAGIRI', 'RAIGAD']),
  category: z.enum(['BEACH', 'WATERFALL', 'FORT', 'TEMPLE', 'TRAIL', 'VIEWPOINT', 'EATERY', 'HERITAGE', 'HOMESTAY', 'OTHER']),
  description: z.string().min(20),
  latitude: z.number(),
  longitude: z.number(),
  difficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXPERT']),
  crowdLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  roadCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'OFFROAD']),
  bestSeason: z.enum(['MONSOON', 'WINTER', 'SUMMER', 'ALL_YEAR']),
  entryFee: z.string().optional(),
  parking: z.string().optional(),
  network: z.string().optional(),
  accessibility: z.string().optional(),
  sunset: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export async function submitContributionAction(data: z.infer<typeof contributionSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = contributionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const result = await createLocation({
      ...parsed.data,
      slug,
      userId: session.user.id,
      hiddenScore: 0,
      tags: parsed.data.tags || [],
      images: parsed.data.images || [],
      status: 'PENDING',
    } as any);

    revalidatePath('/explore');
    revalidatePath('/profile');
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const statusUpdateSchema = z.object({
  locationId: z.string().min(1),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']),
});

export async function updateLocationStatusAction(data: z.infer<typeof statusUpdateSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } };
    }

    const parsed = statusUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await updateLocationStatus(parsed.data.locationId, parsed.data.status, session.user.id);
    
    revalidatePath(`/location/[slug]`, 'page');
    revalidatePath('/explore');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const editLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).optional(),
  district: z.enum(['SINDHUDURG', 'RATNAGIRI', 'RAIGAD']).optional(),
  category: z.enum(['BEACH', 'WATERFALL', 'FORT', 'TEMPLE', 'TRAIL', 'VIEWPOINT', 'EATERY', 'HERITAGE', 'HOMESTAY', 'OTHER']).optional(),
  description: z.string().min(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXPERT']).optional(),
  crowdLevel: z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  roadCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'OFFROAD']).optional(),
  bestSeason: z.enum(['MONSOON', 'WINTER', 'SUMMER', 'ALL_YEAR']).optional(),
  entryFee: z.string().optional(),
  parking: z.string().optional(),
  network: z.string().optional(),
  accessibility: z.string().optional(),
  sunset: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export async function editLocationAction(data: z.infer<typeof editLocationSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = editLocationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const { id, ...updateData } = parsed.data;

    const result = await updateLocation(id, session.user.id, updateData);

    revalidatePath('/explore');
    revalidatePath('/profile');
    revalidatePath(`/location/${result.slug}`, 'page');
    revalidateTag('locations');
    revalidateTag('location');
    
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

export async function checkNearbyLocationsAction(lat: number, lng: number): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }
    const { getNearbyLocations } = await import('@/services/location');
    const result = await getNearbyLocations(lat, lng, 100);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
