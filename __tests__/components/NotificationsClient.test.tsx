import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { NotificationsClient } from '@/app/notifications/NotificationsClient';
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from '@/actions/notifications';
import { useRouter } from 'next/navigation';

vi.mock('@/actions/notifications', () => ({
  markNotificationAsReadAction: vi.fn(),
  markAllNotificationsAsReadAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('NotificationsClient', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  const mockNotifications = [
    {
      id: 'n1',
      title: 'New Like',
      message: 'Someone liked your story',
      type: 'LIKE',
      read: false,
      createdAt: new Date().toISOString(),
      location: null,
      actor: { id: 'u1' }
    },
    {
      id: 'n2',
      title: 'Weather Alert',
      message: 'Heavy rain expected',
      type: 'WEATHER_ALERT',
      read: true,
      createdAt: new Date().toISOString(),
      location: { slug: 'heavy-rain-place' },
      actor: null
    }
  ];

  test('renders empty state when no notifications exist', () => {
    render(<NotificationsClient initialNotifications={[]} />);
    expect(screen.getByText('No notifications yet')).toBeDefined();
  });

  test('renders notifications correctly', () => {
    render(<NotificationsClient initialNotifications={mockNotifications} />);
    expect(screen.getByText('New Like')).toBeDefined();
    expect(screen.getByText('Weather Alert')).toBeDefined();
    expect(screen.getByText('You have 1 unread messages')).toBeDefined();
  });

  test('marks single notification as read and navigates', async () => {
    (markNotificationAsReadAction as any).mockResolvedValue({ success: true, data: { success: true } });
    
    render(<NotificationsClient initialNotifications={mockNotifications} />);
    
    const unreadItem = screen.getByText('New Like').closest('div[role="button"]');
    await act(async () => {
      fireEvent.click(unreadItem!);
    });
    
    // Check navigation based on actor
    expect(markNotificationAsReadAction).toHaveBeenCalledWith('n1');
    
    // Check navigation based on actor
    expect(mockPush).toHaveBeenCalledWith('/profile/u1');
  });

  test('handles error when marking as read', async () => {
    (markNotificationAsReadAction as any).mockResolvedValue({ success: false, error: { message: 'Failed' } });
    
    render(<NotificationsClient initialNotifications={mockNotifications} />);
    
    const unreadItem = screen.getByText('New Like').closest('div[role="button"]');
    await act(async () => {
      fireEvent.click(unreadItem!);
    });
    
    await waitFor(() => {
      const { toast } = require('sonner');
      expect(toast.error).toHaveBeenCalledWith('Failed');
    });
  });

  test('marks all notifications as read', async () => {
    (markAllNotificationsAsReadAction as any).mockResolvedValue({ success: true, data: { success: true } });
    
    render(<NotificationsClient initialNotifications={mockNotifications} />);
    
    const markAllBtn = screen.getByRole('button', { name: /Mark all as read/i });
    await act(async () => {
      fireEvent.click(markAllBtn);
    });
    
    expect(markAllNotificationsAsReadAction).toHaveBeenCalled();
  });
  
  test('keyboard navigation for marking as read', async () => {
    (markNotificationAsReadAction as any).mockResolvedValue({ success: true, data: { success: true } });
    
    render(<NotificationsClient initialNotifications={mockNotifications} />);
    
    const unreadItem = screen.getByText('New Like').closest('div[role="button"]');
    
    // Simulate Enter key
    await act(async () => {
      fireEvent.keyDown(unreadItem!, { key: 'Enter', code: 'Enter' });
    });
    
    expect(markNotificationAsReadAction).toHaveBeenCalledWith('n1');
    expect(markNotificationAsReadAction).toHaveBeenCalledWith('n1');
  });
});
