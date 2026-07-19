'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Helper to check mod/admin
async function checkModerator() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'MODERATOR' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

// Helper to check admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

// Helper to log action
async function logModAction(moderatorId: string, action: string, targetId?: string, targetType?: string, details?: string) {
  await prisma.moderatorActionLog.create({
    data: { moderatorId, action, targetId, targetType, details }
  });
}

const reportSchema = z.object({
  type: z.enum(['POST', 'COMMENT', 'REVIEW', 'STORY', 'LOCATION', 'USER']),
  targetId: z.string().min(1),
  reason: z.string().min(10)
});

export async function createReportAction(data: z.infer<typeof reportSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const parsed = reportSchema.parse(data);
    const result = await prisma.report.create({
      data: {
        ...parsed,
        reporterId: session.user.id
      }
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resolveReportAction(reportId: string, action: 'DISMISS' | 'DELETE_CONTENT', notes?: string) {
  try {
    const mod = await checkModerator();
    
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found');

    await prisma.$transaction(async (tx) => {
      if (action === 'DELETE_CONTENT') {
        if (report.type === 'POST') await tx.communityPost.delete({ where: { id: report.targetId } });
        else if (report.type === 'COMMENT') await tx.comment.delete({ where: { id: report.targetId } });
        else if (report.type === 'REVIEW') await tx.review.delete({ where: { id: report.targetId } });
        else if (report.type === 'STORY') await tx.story.delete({ where: { id: report.targetId } });
        else if (report.type === 'LOCATION') await tx.location.delete({ where: { id: report.targetId } });
        
        await logModAction(mod.id, 'DELETED_REPORTED_CONTENT', report.targetId, report.type, notes);
      } else {
        await logModAction(mod.id, 'DISMISSED_REPORT', report.targetId, report.type, notes);
      }

      await tx.report.update({
        where: { id: reportId },
        data: { status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED', notes }
      });
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function suspendUserAction(userId: string, durationHours: number, reason: string) {
  try {
    const mod = await checkModerator();
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');
    if (targetUser.role === 'ADMIN') throw new Error('Cannot suspend an admin');

    const suspendedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { suspendedUntil }
    });

    await logModAction(mod.id, 'SUSPENDED_USER', userId, 'USER', `Duration: ${durationHours}h. Reason: ${reason}`);

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function manageUserAction(userId: string, action: 'BAN' | 'UNBAN' | 'SHADOWBAN' | 'UNSHADOWBAN') {
  try {
    const admin = await checkAdmin();
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');
    if (targetUser.role === 'ADMIN' && targetUser.id !== admin.id) throw new Error('Cannot manage another admin');

    let updateData = {};
    if (action === 'BAN') updateData = { isBanned: true };
    if (action === 'UNBAN') updateData = { isBanned: false };
    if (action === 'SHADOWBAN') updateData = { isShadowbanned: true };
    if (action === 'UNSHADOWBAN') updateData = { isShadowbanned: false };

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    await logModAction(admin.id, action, userId, 'USER');

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeUserRoleAction(userId: string, newRole: 'USER' | 'MODERATOR') {
  try {
    const admin = await checkAdmin();
    
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error('User not found');
    if (targetUser.role === 'ADMIN') throw new Error('Cannot change admin roles');

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    await logModAction(admin.id, `CHANGED_ROLE_TO_${newRole}`, userId, 'USER');

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
