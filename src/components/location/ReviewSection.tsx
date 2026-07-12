'use client';

import React, { useState, useTransition } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReviewData } from '@/types';
import { submitReviewAction } from '@/actions/reviews';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface ReviewSectionProps {
  locationId: string;
  reviews: ReviewData[];
  isAuthenticated: boolean;
}

export function ReviewSection({ locationId, reviews, isAuthenticated }: ReviewSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (open: boolean) => {
    if (open && !isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    setIsOpen(open);
    if (!open) {
      // Reset form
      setRating(0);
      setContent('');
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (content.length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    startTransition(async () => {
      const result = await submitReviewAction({
        locationId,
        rating,
        content,
      });

      if (result.success) {
        toast.success('Review submitted successfully!');
        setIsOpen(false);
      } else {
        toast.error(result.error?.message || 'Failed to submit review');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Reviews ({reviews.length})</h3>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button variant="outline" />}>
            Write a Review
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience at this location to help others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Rating</label>
                <div 
                  className="flex items-center space-x-1"
                  role="radiogroup" 
                  aria-label="Rating"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground opacity-30'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="review-content" className="text-sm font-medium leading-none">Review</label>
                <Textarea
                  id="review-content"
                  placeholder="What did you think of this place?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPending}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No reviews yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Be the first to share your experience!</p>
          <Button className="mt-4" variant="outline" onClick={() => handleOpenChange(true)}>Be the first to review</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-xl bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {review.user?.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={review.user.avatar} alt={review.user.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.user?.name || 'Anonymous User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mt-3 whitespace-pre-wrap">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
