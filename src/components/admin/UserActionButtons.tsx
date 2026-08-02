'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { manageUserAction, suspendUserAction, changeUserRoleAction } from '@/actions/moderation';
import { toast } from 'sonner';
import { User } from '@prisma/client';

export function UserActionButtons({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = () => {
    startTransition(async () => {
      const newRole = user.role === 'MODERATOR' ? 'USER' : 'MODERATOR';
      const result = await changeUserRoleAction(user.id, newRole);
      if (result.success) toast.success(`User role changed to ${newRole}`);
      else toast.error(result.error || 'Failed to change role');
    });
  };

  const handleManage = (action: 'BAN' | 'UNBAN' | 'SHADOWBAN' | 'UNSHADOWBAN' | 'UNSUSPEND') => {
    startTransition(async () => {
      const result = await manageUserAction(user.id, action);
      if (result.success) toast.success(`Action ${action} successful`);
      else toast.error(result.error || 'Action failed');
    });
  };

  const handleSuspend = () => {
    startTransition(async () => {
      const result = await suspendUserAction(user.id, 24, 'Admin suspended');
      if (result.success) toast.success('User suspended for 24 hours');
      else toast.error(result.error || 'Failed to suspend user');
    });
  };

  if (user.role === 'ADMIN') return null;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        disabled={isPending}
        onClick={handleRoleChange}
      >
        {user.role === 'MODERATOR' ? 'Demote to User' : 'Promote to Mod'}
      </Button>

      {!user.isBanned ? (
        <Button variant="destructive" size="sm" disabled={isPending} onClick={() => handleManage('BAN')}>
          Ban User
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleManage('UNBAN')}>
          Unban
        </Button>
      )}

      {!user.isShadowbanned ? (
        <Button variant="secondary" size="sm" disabled={isPending} onClick={() => handleManage('SHADOWBAN')}>
          Shadowban
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleManage('UNSHADOWBAN')}>
          Remove Shadowban
        </Button>
      )}

      {!user.suspendedUntil || new Date(user.suspendedUntil) < new Date() ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-orange-500 text-orange-500 hover:bg-orange-50" 
          disabled={isPending} 
          onClick={handleSuspend}
        >
          Suspend (24h)
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleManage('UNSUSPEND')}>
          Remove Suspension
        </Button>
      )}
    </div>
  );
}
