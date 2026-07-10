import { describe, it, expect, vi } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    location: {
      findMany: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Beach' }])
    }
  }
}));

// Mock unstable_cache
vi.mock('next/cache', () => ({
  unstable_cache: (cb: any) => cb
}));

import { getLocations } from '@/services/location';

describe('Location Service', () => {
  it('should return locations', async () => {
    const locations = await getLocations();
    expect(locations).toHaveLength(1);
    expect(locations[0].name).toBe('Test Beach');
  });
});
