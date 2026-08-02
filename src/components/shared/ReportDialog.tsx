'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { createReportAction } from '@/actions/moderation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ReportType = 'POST' | 'COMMENT' | 'REVIEW' | 'STORY' | 'LOCATION' | 'USER';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  type: ReportType;
}

const REPORT_REASONS = [
  'Spam or Self-Promotion',
  'Harassment or Abuse',
  'Misinformation',
  'Inappropriate Content',
  'Copyright Violation',
  'Other'
];

export function ReportDialog({ isOpen, onClose, targetId, type }: ReportDialogProps) {
  const { data: session } = useSession();
  const [reasonCategory, setReasonCategory] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to report content.');
      return;
    }
    if (!reasonCategory) {
      toast.error('Please select a reason.');
      return;
    }

    const finalReason = details ? `${reasonCategory}: ${details}` : reasonCategory;

    if (finalReason.length < 10) {
      toast.error('Please provide a little more detail (minimum 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReportAction({
        type,
        targetId,
        reason: finalReason
      });

      if (result.success) {
        toast.success('Report submitted successfully. Thank you for keeping our community safe.');
        onClose();
        // Reset form
        setReasonCategory('');
        setDetails('');
      } else {
        toast.error(result.error || 'Failed to submit report.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Let us know why this content violates our guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Select value={reasonCategory} onValueChange={(val) => val && setReasonCategory(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Provide additional details (optional, but helpful)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
