import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function recalculateUserReputation(
  userId: string,
  txClient?: TransactionClient
) {
  const db = txClient || prisma;

  // 1. Fetch user data with necessary aggregates
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          followers: true,
        },
      },
      locations: {
        include: {
          _count: {
            select: { savedBy: true, reviews: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      },
      verifications: {
        where: { status: 'APPROVED' },
      },
    },
  });

  if (!user) return 0;

  let approvedLocationsCount = 0;
  let rejectedLocationsCount = 0;
  let verifiedContributedCount = 0;
  let totalSavesOnUserLocations = 0;
  let qualityBonus = 0;

  for (const loc of user.locations) {
    if (loc.status === 'APPROVED') {
      approvedLocationsCount++;
    } else if (loc.status === 'REJECTED') {
      rejectedLocationsCount++;
    }

    if (loc.verified) {
      verifiedContributedCount++;
    }

    // Saves
    totalSavesOnUserLocations += loc._count.savedBy;

    // Quality Bonus: Hidden Score
    if (loc.hiddenScore >= 80) {
      qualityBonus += 4;
    } else if (loc.hiddenScore >= 60 && loc.hiddenScore < 80) {
      qualityBonus += 2;
    }

    // Quality Bonus: Reviews
    if (loc._count.reviews >= 3) {
      const totalRating = loc.reviews.reduce((acc, rev) => acc + rev.rating, 0);
      const avgRating = totalRating / loc._count.reviews;
      if (avgRating >= 4.5) {
        qualityBonus += 3;
      }
    }
  }

  const approvedVerificationsCount = user.verifications.length;
  const followersCount = user._count.followers;

  // Calculate the score components
  const scoreApprovedLocations = 12 * approvedLocationsCount;
  const scoreRejectedLocations = -6 * rejectedLocationsCount;
  const scoreApprovedVerifications = 5 * approvedVerificationsCount;
  const scoreVerifiedContributed = 4 * verifiedContributedCount;
  
  const scoreFollowers = 2 * Math.floor(Math.log2(followersCount + 1));
  const scoreSaves = 2 * Math.floor(Math.log2(totalSavesOnUserLocations + 1));

  const totalReputation =
    scoreApprovedLocations +
    scoreRejectedLocations +
    scoreApprovedVerifications +
    scoreVerifiedContributed +
    scoreFollowers +
    scoreSaves +
    qualityBonus;

  // Update user
  await db.user.update({
    where: { id: userId },
    data: { reputation: totalReputation },
  });

  return totalReputation;
}
