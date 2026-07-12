import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { SavedPlacesList } from '@/components/saved/SavedPlacesList';

// Mock SaveButton since we unit test it separately
vi.mock('@/components/location/SaveButton', () => ({
  SaveButton: ({ locationId }: { locationId: string }) => (
    <button data-testid="mock-save-button">{locationId}</button>
  ),
}));

describe('SavedPlacesList Component', () => {
  const mockLocations = [
    {
      id: 'loc1',
      name: 'Secret Waterfall',
      slug: 'secret-waterfall',
      district: 'SINDHUDURG',
      category: 'WATERFALL',
      description: 'A beautiful hidden waterfall.',
      images: ['/test.jpg'],
      hiddenScore: 85,
      tags: ['nature', 'trekking'],
    },
    {
      id: 'loc2',
      name: 'Hidden Beach',
      slug: 'hidden-beach',
      district: 'RATNAGIRI',
      category: 'BEACH',
      description: 'Quiet pristine beach.',
      images: ['/beach.jpg'],
      hiddenScore: 92,
      tags: ['beach'],
    }
  ];

  test('renders empty state when no locations provided', () => {
    render(<SavedPlacesList locations={[]} />);
    expect(screen.getByText('No saved places yet')).toBeDefined();
    expect(screen.getByText("Start exploring and save places you'd like to visit later.")).toBeDefined();
  });

  test('renders list of saved locations', () => {
    render(<SavedPlacesList locations={mockLocations} />);
    
    // Check titles
    expect(screen.getByText('Secret Waterfall')).toBeDefined();
    expect(screen.getByText('Hidden Beach')).toBeDefined();
    
    // Check SaveButton mock is rendered with location IDs
    const saveButtons = screen.getAllByTestId('mock-save-button');
    expect(saveButtons).toHaveLength(2);
    expect(saveButtons[0].textContent).toBe('loc1');
    expect(saveButtons[1].textContent).toBe('loc2');
  });
});
