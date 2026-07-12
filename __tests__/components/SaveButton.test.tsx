import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { SaveButton } from '@/components/location/SaveButton';
import { toggleSaveAction } from '@/actions/interactions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/actions/interactions', () => ({
  toggleSaveAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SaveButton Component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  test('redirects unauthenticated users to sign-in', () => {
    render(<SaveButton locationId="loc1" initialSaved={false} isAuthenticated={false} />);
    const button = screen.getByRole('button', { name: /Save place/i });
    fireEvent.click(button);
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
    expect(toggleSaveAction).not.toHaveBeenCalled();
  });

  test('calls toggleSaveAction and updates state optimistically on success', async () => {
    (toggleSaveAction as any).mockResolvedValue({ success: true, data: { saved: true } });

    render(<SaveButton locationId="loc1" initialSaved={false} isAuthenticated={true} />);
    const button = screen.getByRole('button', { name: /Save place/i });
    
    // Initial state
    expect(screen.getByText('Save')).toBeDefined();

    fireEvent.click(button);

    // Optimistic update
    expect(screen.getByText('Saved')).toBeDefined();
    expect(toggleSaveAction).toHaveBeenCalledWith('loc1');

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Saved to your places');
    });
  });

  test('reverts optimistic update on failure', async () => {
    (toggleSaveAction as any).mockResolvedValue({ success: false, error: { message: 'Network error' } });

    render(<SaveButton locationId="loc1" initialSaved={false} isAuthenticated={true} />);
    const button = screen.getByRole('button', { name: /Save place/i });
    
    fireEvent.click(button);

    // Optimistic update
    expect(screen.getByText('Saved')).toBeDefined();

    await waitFor(() => {
      // Reverted
      expect(screen.getByText('Save')).toBeDefined();
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  test('handles icon variant', () => {
    render(<SaveButton locationId="loc1" initialSaved={true} variant="icon" isAuthenticated={true} />);
    // Icon variant doesn't have text "Saved" or "Save", but it should have aria-label
    const button = screen.getByRole('button', { name: /Unsave place/i });
    expect(button).toBeDefined();
  });
});
