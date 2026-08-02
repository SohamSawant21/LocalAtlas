'use server';

import { auth } from '@/auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ActionResponse } from '@/types';
import { revalidatePath, updateTag } from 'next/cache';
import { recalculateUserReputation } from '@/services/reputation';

const verifySchema = z.object({
  locationId: z.string().min(1),
});

export async function verifyLocationAction(locationId: string): Promise<ActionResponse<{ verified: boolean, verificationCount: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in.' } };
    }

    const parsed = verifySchema.safeParse({ locationId });
    if (!parsed.success) {
      return { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid location ID.' } };
    }

    const userId = session.user.id;

    // Fetch user and location info in a single transaction or sequentially
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.reputation < 50) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You need at least 50 reputation to verify a location.' } };
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Location not found.' } };
    }

    if (location.userId === userId) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'You cannot verify your own location.' } };
    }

    // Attempt to create the verification
    const result = await prisma.$transaction(async (tx) => {
      // Create verification (throws if duplicate due to unique constraint)
      await tx.verification.create({
        data: {
          userId,
          locationId
        }
      });

      // Increment count
      const updatedLocation = await tx.location.update({
        where: { id: locationId },
        data: { verificationCount: { increment: 1 } }
      });

      let newlyVerified = false;
      if (updatedLocation.verificationCount >= 3 && !updatedLocation.verified) {
        await tx.location.update({
          where: { id: locationId },
          data: { verified: true }
        });
        newlyVerified = true;
        
        // Notify contributor
        await tx.notification.create({
          data: {
            type: 'VERIFICATION',
            title: 'Location Verified!',
            message: `Your contribution "${updatedLocation.name}" has been verified by the community.`,
            userId: updatedLocation.userId,
            locationId: updatedLocation.id
          }
        });
      }

      // Reputation recalculation
      // Recalculate verifier's reputation
      await recalculateUserReputation(userId, tx as any);
      
      // If location just became verified, recalculate contributor's reputation
      if (newlyVerified) {
        await recalculateUserReputation(updatedLocation.userId, tx as any);
      }

      return {
        verified: updatedLocation.verificationCount >= 3,
        verificationCount: updatedLocation.verificationCount
      };
    });

    revalidatePath(`/location/${location.slug}`);
    revalidatePath(`/location/${location.slug}`, 'page');
    revalidatePath('/profile');
    
    return { success: true, data: result };

  } catch (error: any) {
    if (error.code === 'P2002') {
       return { success: false, error: { code: 'CONFLICT', message: 'You have already verified this location.' } };
    }
    return { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } };
  }
}
