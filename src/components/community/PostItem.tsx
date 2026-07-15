"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toggleCommunityLikeAction } from '@/actions/community';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function PostItem({ post, currentUserId }: { post: any, currentUserId?: string }) {
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();

  // Optimistic UI state for likes
  const initialIsLiked = post.likes?.some((like: any) => like.userId === currentUserId) || false;
  const initialLikeCount = post.likes?.length || 0;
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) {
      toast('Please login to like posts');
      return;
    }
    
    if (isLiking) return;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const res = await toggleCommunityLikeAction({ postId: post.id });
      if (!res.success) {
        throw new Error(res.error?.message);
      }
      // Revert if response differs (though we revalidate server side)
      if (res.data?.liked !== !isLiked) {
         setIsLiked(res.data?.liked || false);
         setLikeCount(res.data?.liked ? likeCount + 1 : likeCount - 1); // Simplistic revert
      }
    } catch (err: any) {
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast.error(err.message);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/50 bg-card hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src={post.user?.avatar || ''} alt={post.user?.name || 'User'} />
          <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{post.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        {post.imageUrl && (
          <div className="mt-4 rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col border-t border-border/40 pt-4 pb-4 px-6 bg-muted/5">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 px-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{post.comments?.length || 0} Comments</span>
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-6 pt-4 border-t border-border/40">
            <CommentSection 
              postId={post.id} 
              comments={post.comments || []} 
              currentUserId={currentUserId} 
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
