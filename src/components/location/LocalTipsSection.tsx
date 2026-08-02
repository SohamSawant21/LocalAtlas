'use client';

import React, { useState } from 'react';
import { PostItem } from '@/components/community/PostItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, AlertTriangle, Info } from 'lucide-react';
import { createCommunityPostAction } from '@/actions/community';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LocalTipsSectionProps {
  locationId: string;
  initialTips: any[];
  currentUserId?: string;
  isAuthenticated: boolean;
  legacySafety?: string | null;
  legacyBestTime?: string | null;
}

export function LocalTipsSection({ 
  locationId, 
  initialTips, 
  currentUserId, 
  isAuthenticated,
  legacySafety,
  legacyBestTime
}: LocalTipsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createCommunityPostAction({
        title: 'Local Tip',
        content: content.trim(),
        category: 'TRAVEL_TIP',
        locationId: locationId,
        imageUrls: [],
      });

      if (res.success) {
        toast.success("Tip added successfully!");
        setContent('');
        setIsAdding(false);
        router.refresh();
      } else {
        throw new Error(res.error?.message || "Failed to add tip");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLegacyTips = legacySafety || legacyBestTime;
  const hasTips = initialTips.length > 0 || hasLegacyTips;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Community Tips</h3>
        {!isAdding && (
          <Button onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please login to add a tip");
              return;
            }
            setIsAdding(true);
          }} variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Tip
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <h4 className="font-medium text-sm">Share a tip with other travelers</h4>
          <Textarea 
            placeholder="e.g. Best time to visit is early morning, watch out for slippery rocks..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={isSubmitting}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Tip
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {legacySafety && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">Safety Tip</h4>
              <p className="text-sm text-yellow-800/80 dark:text-yellow-400/80 mt-1 leading-relaxed">{legacySafety}</p>
            </div>
          </div>
        )}
        
        {legacyBestTime && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex gap-4">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-400">Best Time to Visit</h4>
              <p className="text-sm text-blue-800/80 dark:text-blue-400/80 mt-1 leading-relaxed">{legacyBestTime}</p>
            </div>
          </div>
        )}

        {!hasTips ? (
          <p className="text-muted-foreground text-center py-8 bg-muted/20 rounded-xl border border-dashed">
            No local tips available for this location yet. Be the first to share one!
          </p>
        ) : (
          initialTips.map(tip => (
            <PostItem key={tip.id} post={tip} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  );
}
