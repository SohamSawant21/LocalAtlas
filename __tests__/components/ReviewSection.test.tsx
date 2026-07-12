import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { ReviewSection } from '@/components/location/ReviewSection';
import { submitReviewAction } from '@/actions/reviews';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/actions/reviews', () => ({
  submitReviewAction: vi.fn(),
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

describe('ReviewSection', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  const mockReviews: any[] = [
    {
      id: 'rev1',
      rating: 4,
      content: 'Great place to visit!',
      createdAt: new Date('2026-07-10T10:00:00Z'),
      user: { name: 'John Doe', avatar: '' },
    },
  ];

  test('renders empty state correctly', () => {
    render(<ReviewSection locationId="loc1" reviews={[]} isAuthenticated={true} />);
    expect(screen.getByText('No reviews yet')).toBeDefined();
    expect(screen.getByText('Be the first to share your experience!')).toBeDefined();
  });

  test('renders reviews correctly', () => {
    render(<ReviewSection locationId="loc1" reviews={mockReviews} isAuthenticated={true} />);
    expect(screen.getByText('Reviews (1)')).toBeDefined();
    expect(screen.getByText('Great place to visit!')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  test('redirects unauthenticated users to sign-in', () => {
    render(<ReviewSection locationId="loc1" reviews={[]} isAuthenticated={false} />);
    const writeButton = screen.getByText('Write a Review');
    fireEvent.click(writeButton);
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  test('allows authenticated users to open form and submit', async () => {
    (submitReviewAction as any).mockResolvedValue({ success: true, data: {} });

    render(<ReviewSection locationId="loc1" reviews={[]} isAuthenticated={true} />);
    
    // Open modal
    const writeButton = screen.getByText('Write a Review');
    fireEvent.click(writeButton);

    // Form should be visible
    expect(screen.getByText('Submit Review')).toBeDefined();

    // Select 5 stars
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[4]);

    // Enter review text
    const textarea = screen.getByPlaceholderText('What did you think of this place?');
    fireEvent.change(textarea, { target: { value: 'This is an amazing place!' } });

    // Submit
    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitReviewAction).toHaveBeenCalledWith({
        locationId: 'loc1',
        rating: 5,
        content: 'This is an amazing place!',
      });
    });
  });

  test('shows validation errors', async () => {
    render(<ReviewSection locationId="loc1" reviews={[]} isAuthenticated={true} />);
    
    fireEvent.click(screen.getByText('Write a Review'));
    
    // Submit without rating
    fireEvent.click(screen.getByText('Submit Review'));
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Please select a rating');
  });
});
