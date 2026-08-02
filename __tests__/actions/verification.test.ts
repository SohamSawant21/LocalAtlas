import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyLocationAction } from '@/actions/verification';

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  location: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  verification: {
    create: vi.fn(),
  },
  notification: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async function(this: any, callback: any) {
    return await callback(this);
  }),
}));

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock('@/services/reputation', () => ({
  recalculateUserReputation: vi.fn(),
}));

import { auth } from '@/auth';
import { recalculateUserReputation } from '@/services/reputation';
import { revalidatePath } from 'next/cache';

describe('verifyLocationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if not authenticated', async () => {
    (auth as any).mockResolvedValue(null);
    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('UNAUTHORIZED');
  });

  it('fails if user reputation is below 50', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 49 });
    
    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('FORBIDDEN');
  });

  it('fails if location does not exist', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 50 });
    prismaMock.location.findUnique.mockResolvedValue(null);
    
    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('NOT_FOUND');
  });

  it('fails if user tries to verify their own location', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 50 });
    prismaMock.location.findUnique.mockResolvedValue({ id: 'loc_123', userId: 'user_1' });
    
    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('FORBIDDEN');
  });

  it('fails if user already verified (duplicate)', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 50 });
    prismaMock.location.findUnique.mockResolvedValue({ id: 'loc_123', userId: 'user_2' });
    
    prismaMock.verification.create.mockRejectedValueOnce({ code: 'P2002' });
    
    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('CONFLICT');
  });

  it('succeeds but does not verify location if threshold not met', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 50 });
    prismaMock.location.findUnique.mockResolvedValue({ id: 'loc_123', userId: 'user_2', verificationCount: 1, verified: false });
    
    prismaMock.location.update.mockResolvedValue({ id: 'loc_123', userId: 'user_2', verificationCount: 2, verified: false });

    const res = await verifyLocationAction('loc_123');
    if (!res.success) console.log(res.error);
    expect(res.success).toBe(true);
    expect(res.data?.verified).toBe(false);
    expect(res.data?.verificationCount).toBe(2);
    
    // Check reputation called for verifier ONLY
    expect(recalculateUserReputation).toHaveBeenCalledTimes(1);
    expect(recalculateUserReputation).toHaveBeenCalledWith('user_1', prismaMock);
    
    // Notification not sent
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it('succeeds and verifies location when threshold is met', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user_1' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', reputation: 50 });
    prismaMock.location.findUnique.mockResolvedValue({ id: 'loc_123', userId: 'user_2', verificationCount: 2, name: 'Cool Spot', verified: false, slug: 'cool-spot' });
    
    // First update (increment count)
    prismaMock.location.update.mockResolvedValueOnce({ id: 'loc_123', userId: 'user_2', verificationCount: 3, name: 'Cool Spot', verified: false, slug: 'cool-spot' });
    // Second update (set verified: true)
    prismaMock.location.update.mockResolvedValueOnce({ id: 'loc_123', userId: 'user_2', verificationCount: 3, name: 'Cool Spot', verified: true, slug: 'cool-spot' });

    const res = await verifyLocationAction('loc_123');
    expect(res.success).toBe(true);
    expect(res.data?.verified).toBe(true);
    expect(res.data?.verificationCount).toBe(3);
    
    // Check reputation called for both users
    expect(recalculateUserReputation).toHaveBeenCalledTimes(2);
    expect(recalculateUserReputation).toHaveBeenCalledWith('user_1', prismaMock);
    expect(recalculateUserReputation).toHaveBeenCalledWith('user_2', prismaMock);
    
    // Check notification sent
    expect(prismaMock.notification.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'VERIFICATION',
        userId: 'user_2',
      })
    }));
  });
});
