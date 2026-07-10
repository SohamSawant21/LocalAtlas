import prisma from '@/lib/prisma';
import { NotificationType } from '@/types';

export async function createNotification({
  type,
  title,
  message,
  userId,
  actorId,
  locationId,
}: {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  actorId?: string;
  locationId?: string;
}) {
  if (userId === actorId) return; // Don't notify self

  return prisma.notification.create({
    data: {
      type,
      title,
      message,
      userId,
      actorId,
      locationId,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: { id: true, name: true, avatar: true },
      },
      location: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}
