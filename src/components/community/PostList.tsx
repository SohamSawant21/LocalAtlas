"use client";

import React, { useState } from 'react';
import { PostItem } from './PostItem';
import { Button } from '@/components/ui/button';
import { fetchCommunityPosts } from '@/actions/community';
import { Loader2 } from 'lucide-react';

export function PostList({ initialPosts, initialNextCursor, currentUserId, categoryFilter }: { initialPosts: any[], initialNextCursor?: string, currentUserId?: string, categoryFilter?: any }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetchCommunityPosts(nextCursor, 10, categoryFilter);
      setPosts(prev => [...prev, ...res.posts]);
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">No posts yet. Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} currentUserId={currentUserId} />
      ))}
      {nextCursor && (
        <div className="pt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
