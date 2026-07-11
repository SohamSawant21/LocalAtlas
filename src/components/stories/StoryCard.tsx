/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    content: string;
    coverImage: string;
    createdAt: Date;
    user: User;
  };
  featured?: boolean;
}

export function StoryCard({ story, featured = false }: StoryCardProps) {
  const [likes, setLikes] = useState(84);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  return (
    <Card className={`overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card ${featured ? 'md:col-span-2 md:flex-row' : ''}`}>
      <div className={`relative overflow-hidden shrink-0 w-full aspect-[4/3] ${featured ? 'md:w-1/2 md:aspect-auto md:min-h-[300px]' : ''}`}>
        <img
          src={story.coverImage}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className={`flex flex-col flex-1 ${featured ? 'md:w-1/2' : ''}`}>
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6 border border-primary/20">
              <AvatarImage src={story.user.avatar} alt={story.user.name} />
              <AvatarFallback className="text-[10px]">{story.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium">{story.user.name}</span>
            <span className="text-xs text-muted-foreground/50 mx-1">•</span>
            <span className="text-xs text-muted-foreground/80">
              {formatDistanceToNow(story.createdAt, { addSuffix: true })}
            </span>
          </div>
          <h3 className={`font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-lg'}`}>
            {story.title}
          </h3>
        </CardHeader>
        
        <CardContent className="px-5 pb-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {story.content}
          </p>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{Math.floor(likes / 3)}</span>
            </div>
          </div>
          
          <Link href={`/stories/${story.id}`}>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/10">
              Read More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
