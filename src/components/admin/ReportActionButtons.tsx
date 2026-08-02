'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { resolveReportAction } from '@/actions/moderation';
import { toast } from 'sonner';

export function ReportActionButtons({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (action: 'DISMISS' | 'DELETE_CONTENT') => {
    startTransition(async () => {
      const result = await resolveReportAction(
        reportId,
        action,
        action === 'DISMISS' ? 'Report found to be invalid.' : 'Content violated guidelines.'
      );
      
      if (result.success) {
        toast.success(action === 'DISMISS' ? 'Report dismissed.' : 'Content deleted successfully.');
      } else {
        toast.error(result.error || 'Failed to process report.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      <Button 
        variant="destructive" 
        className="w-full"
        disabled={isPending}
        onClick={() => handleAction('DELETE_CONTENT')}
      >
        {isPending ? 'Processing...' : 'Delete Content'}
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        disabled={isPending}
        onClick={() => handleAction('DISMISS')}
      >
        {isPending ? 'Processing...' : 'Dismiss Report'}
      </Button>
    </div>
  );
}
