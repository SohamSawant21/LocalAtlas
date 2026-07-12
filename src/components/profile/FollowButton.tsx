'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleFollowUserAction } from '@/actions/interactions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    const prev = isFollowing;
    setIsFollowing(!prev);

    startTransition(async () => {
      const res = await toggleFollowUserAction(targetUserId);
      if (!res.success) {
        setIsFollowing(prev);
        toast.error(res.error?.message || 'Failed to toggle follow status.');
      } else {
        setIsFollowing(res.data?.following || false);
      }
    });
  };

  return (
    <Button 
      onClick={handleToggle} 
      disabled={isPending}
      variant={isFollowing ? 'secondary' : 'default'}
    >
      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
