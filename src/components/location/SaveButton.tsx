'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Heart } from 'lucide-react';
import { toggleSaveAction } from '@/actions/interactions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SaveButtonProps {
  locationId: string;
  initialSaved: boolean;
  variant?: 'full' | 'icon';
  isAuthenticated: boolean;
}

export function SaveButton({ locationId, initialSaved, variant = 'full', isAuthenticated }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);
    // Optimistic update
    setIsSaved(!isSaved);
    
    try {
      const response = await toggleSaveAction(locationId);
      if (response.success && response.data) {
        setIsSaved(response.data.saved);
        if (response.data.saved) {
          toast.success('Saved to your places');
        } else {
          toast.success('Removed from saved places');
        }
      } else {
        // Revert on failure
        setIsSaved(isSaved);
        toast.error(response.error?.message || 'Failed to update saved status');
      }
    } catch (error) {
      setIsSaved(isSaved);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button 
        size="icon" 
        variant="secondary" 
        className={`h-8 w-8 rounded-full opacity-90 hover:opacity-100 ${isSaved ? 'hover:text-red-500' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        disabled={isLoading}
        aria-label={isSaved ? "Unsave place" : "Save place"}
      >
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="w-full rounded-xl" 
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isSaved ? "Unsave place" : "Save place"}
    >
      <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}
