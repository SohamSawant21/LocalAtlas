import prisma from '@/lib/prisma';

export async function createTrip(userId: string, name: string, description?: string) {
  return prisma.trip.create({
    data: {
      userId,
      name,
      description,
    },
  });
}

export async function updateTrip(userId: string, tripId: string, name: string, description?: string) {
  return prisma.trip.update({
    where: { id: tripId, userId },
    data: { name, description },
  });
}

export async function deleteTrip(userId: string, tripId: string) {
  return prisma.trip.delete({
    where: { id: tripId, userId },
  });
}

export async function addLocationToTrip(userId: string, tripId: string, locationId: string, notes?: string) {
  // Ensure the user owns the trip
  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
    include: { locations: true },
  });

  if (!trip) throw new Error("Trip not found or unauthorized");

  const newOrder = trip.locations.length;

  return prisma.tripLocation.create({
    data: {
      tripId,
      locationId,
      notes,
      order: newOrder,
    },
  });
}

export async function removeLocationFromTrip(userId: string, tripId: string, tripLocationId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });

  if (!trip) throw new Error("Trip not found or unauthorized");

  return prisma.tripLocation.delete({
    where: { id: tripLocationId, tripId },
  });
}

export async function getUserTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    include: {
      locations: {
        include: { location: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}
