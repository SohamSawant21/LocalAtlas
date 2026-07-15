"use client";

import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Heart, Send, CornerDownRight, Trash2 } from 'lucide-react';
import { createCommunityCommentAction, toggleCommunityLikeAction } from '@/actions/community';
import { toast } from 'sonner';

interface CommentProps {
  comment: any;
  currentUserId?: string;
  postId: string;
  depth?: number;
  replies?: any[];
}

function CommentItem({ comment, currentUserId, postId, depth = 0, replies = [] }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialIsLiked = comment.likes?.some((like: any) => like.userId === currentUserId) || false;
  const initialLikeCount = comment.likes?.length || 0;
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) {
      toast('Please login to like comments');
      return;
    }
    
    if (isLiking) return;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const res = await toggleCommunityLikeAction({ commentId: comment.id });
      if (!res.success) throw new Error(res.error?.message);
    } catch (err: any) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast.error(err.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createCommunityCommentAction({
        postId,
        content: replyContent,
        parentId: comment.id
      });
      if (!res.success) throw new Error(res.error?.message);
      
      setReplyContent('');
      setIsReplying(false);
      toast.success('Reply posted!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    setIsDeleting(true);
    try {
      const { deleteCommunityCommentAction } = await import('@/actions/community');
      const res = await deleteCommunityCommentAction({ commentId: comment.id });
      if (!res.success) throw new Error(res.error?.message || "Failed to delete comment");
      toast.success('Comment deleted!');
    } catch (err: any) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${depth > 0 ? 'mt-4 border-l-2 border-border/50 pl-4 ml-2' : 'mt-6'} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 border border-primary/10 flex-shrink-0">
          <AvatarImage src={comment.user?.avatar || ''} />
          <AvatarFallback className="text-xs">{comment.user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{comment.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center gap-4 pt-1">
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className={`flex items-center gap-1.5 text-xs font-medium hover:text-foreground transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} /> {likeCount}
            </button>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3" /> Reply
            </button>
            
            {currentUserId === comment.userId && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors ml-auto"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
              <CornerDownRight className="h-4 w-4 text-muted-foreground mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] text-sm resize-none bg-background/50"
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button size="sm" onClick={handleReplySubmit} disabled={isSubmitting || !replyContent.trim()}>
                    <Send className="h-3 w-3 mr-2" /> Post Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {replies && replies.length > 0 && (
        <div className="w-full">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              currentUserId={currentUserId} 
              postId={postId}
              depth={depth + 1}
              replies={reply.children}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, comments, currentUserId }: { postId: string, comments: any[], currentUserId?: string }) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!currentUserId) {
      toast('Please login to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCommunityCommentAction({
        postId,
        content: newComment,
      });
      if (!res.success) throw new Error(res.error?.message);
      
      setNewComment('');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build comment tree
  const commentTree = useMemo(() => {
    const map = new Map<string, any>();
    const roots: any[] = [];
    
    // First pass: initialize node map
    comments.forEach(c => {
      map.set(c.id, { ...c, children: [] });
    });
    
    // Second pass: build tree
    comments.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    
    // Sort roots by date descending
    roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return roots;
  }, [comments]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleCommentSubmit} className="flex gap-3">
        <Avatar className="h-8 w-8 border border-primary/10 flex-shrink-0 mt-1">
           <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col items-end gap-2">
          <Textarea
            placeholder="Add a comment..."
            className="min-h-[80px] text-sm resize-none bg-background/50"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            <Send className="h-3 w-3 mr-2" /> Comment
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {commentTree.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            currentUserId={currentUserId}
            postId={postId}
            replies={comment.children}
          />
        ))}
      </div>
    </div>
  );
}
