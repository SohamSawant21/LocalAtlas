"use client";

import React from 'react';
import { PostItem } from './PostItem';

export function PostList({ initialPosts, currentUserId }: { initialPosts: any[], currentUserId?: string }) {
  if (!initialPosts || initialPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">No posts yet. Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialPosts.map((post) => (
        <PostItem key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
