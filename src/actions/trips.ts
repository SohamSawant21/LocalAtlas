'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import { createTrip, updateTrip, deleteTrip, addLocationToTrip, removeLocationFromTrip } from '@/services/trip';
import { ActionResponse } from '@/types';
import { revalidatePath } from 'next/cache';

const tripSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export async function createTripAction(data: z.infer<typeof tripSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = tripSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await createTrip(session.user.id, parsed.data.name, parsed.data.description);
    revalidatePath('/trips');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const updateTripSchema = tripSchema.extend({
  tripId: z.string().min(1),
});

export async function updateTripAction(data: z.infer<typeof updateTripSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = updateTripSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await updateTrip(session.user.id, parsed.data.tripId, parsed.data.name, parsed.data.description);
    revalidatePath('/trips');
    revalidatePath(`/trips/[id]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const deleteTripSchema = z.object({
  tripId: z.string().min(1),
});

export async function deleteTripAction(tripId: string): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = deleteTripSchema.safeParse({ tripId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid trip ID.' } };
    }

    const result = await deleteTrip(session.user.id, parsed.data.tripId);
    revalidatePath('/trips');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const addLocationSchema = z.object({
  tripId: z.string().min(1),
  locationId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function addLocationToTripAction(data: z.infer<typeof addLocationSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = addLocationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await addLocationToTrip(session.user.id, parsed.data.tripId, parsed.data.locationId, parsed.data.notes);
    revalidatePath('/trips');
    revalidatePath(`/trips/[id]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}

const removeLocationSchema = z.object({
  tripId: z.string().min(1),
  tripLocationId: z.string().min(1),
});

export async function removeLocationFromTripAction(data: z.infer<typeof removeLocationSchema>): Promise<ActionResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = removeLocationSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: parsed.error.issues[0].message } };
    }

    const result = await removeLocationFromTrip(session.user.id, parsed.data.tripId, parsed.data.tripLocationId);
    revalidatePath('/trips');
    revalidatePath(`/trips/[id]`, 'page');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
