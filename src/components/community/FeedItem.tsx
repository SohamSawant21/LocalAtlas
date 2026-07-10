"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  location?: string;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  district: string;
}

interface FeedItemProps {
  item: {
    id: string;
    content: string;
    rating: number;
    createdAt: Date;
    user: User;
    locationId: string;
  };
  location?: Location;
}

export function FeedItem({ item, location }: FeedItemProps) {
  const [likes, setLikes] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; user: string; text: string }[]>([
    { id: '1', user: 'Traveler22', text: 'Looks amazing! Need to visit soon.' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now().toString(), user: 'You', text: newComment }]);
    setNewComment('');
  };

  return (
    <Card className="mb-6 overflow-hidden border-border/50 bg-card hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src={item.user.avatar} alt={item.user.name} />
          <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{item.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </span>
          </div>
          {location && (
            <Link href={`/locations/${location.slug}`} className="text-xs text-primary/80 hover:text-primary flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {location.name}, {location.district}
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
        <p className="text-sm text-card-foreground leading-relaxed">
          {item.content}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-border/40 pt-4 pb-4 px-6 bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 px-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">{comments.length}</span>
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-background/50 rounded-md p-3 text-sm border border-border/40">
                  <span className="font-semibold mr-2 text-primary">{comment.user}:</span>
                  <span className="text-muted-foreground">{comment.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button type="submit" size="sm">Post</Button>
            </form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
