"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2, X, Check, Loader2, ImagePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toggleCommunityLikeAction, deleteCommunityPostAction, updateCommunityPostAction } from '@/actions/community';
import { getPresignedUrlAction } from '@/actions/storage';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function PostItem({ post, currentUserId }: { post: any, currentUserId?: string }) {
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();

  // Optimistic UI state for likes
  const initialIsLiked = post.likes?.some((like: any) => like.userId === currentUserId) || false;
  const initialLikeCount = post.likes?.length || 0;
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);
  
  // Edit & Delete state
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  
  // Support both legacy imageUrl (single) and new imageUrls (array)
  const existingImages = post.imageUrls || (post.imageUrl ? [post.imageUrl] : []);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>(existingImages);
  const [editFiles, setEditFiles] = useState<File[]>([]);

  const isOwner = currentUserId === post.userId;
  const isEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

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
      if (res.data?.liked !== !isLiked) {
         setIsLiked(res.data?.liked || false);
         setLikeCount(res.data?.liked ? likeCount + 1 : likeCount - 1);
      }
    } catch (err: any) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      toast.error(err.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteCommunityPostAction({ postId: post.id });
      if (res.success) {
        toast.success("Post deleted successfully");
        router.refresh();
      } else {
        throw new Error(res.error?.message || "Failed to delete post");
      }
    } catch (err: any) {
      toast.error(err.message);
      setIsDeleting(false);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEditFiles((prev) => [...prev, ...newFiles].slice(0, 10 - currentImageUrls.length));
    }
  };

  const removeEditFile = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCurrentImageUrl = (index: number) => {
    setCurrentImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsSubmittingEdit(true);
    let finalImageUrls = [...currentImageUrls];

    try {
      if (editFiles.length > 0) {
        for (const file of editFiles) {
          const presignedRes = await getPresignedUrlAction({
            fileType: file.type,
            fileSize: file.size,
            folder: 'community',
          });

          if (!presignedRes.success || !presignedRes.data) {
            throw new Error(presignedRes.error?.message || `Failed to get upload URL for ${file.name}`);
          }

          const { presignedUrl, publicUrl } = presignedRes.data;
          const uploadRes = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          if (!uploadRes.ok) throw new Error(`Image upload failed for ${file.name}`);
          finalImageUrls.push(publicUrl);
        }
      }

      const res = await updateCommunityPostAction({
        postId: post.id,
        title: editTitle,
        content: editContent,
        imageUrls: finalImageUrls
      });

      if (res.success) {
        toast.success("Post updated successfully");
        setIsEditing(false);
        setEditFiles([]);
        setCurrentImageUrls(finalImageUrls);
        router.refresh();
      } else {
        throw new Error(res.error?.message || "Failed to update post");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditFiles([]);
    setCurrentImageUrls(existingImages);
  };

  return (
    <Card className={`overflow-hidden border-border/50 bg-card transition-shadow ${isDeleting ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-10 w-10 border border-primary/10">
            <AvatarImage src={post.user?.avatar || ''} alt={post.user?.name || 'User'} />
            <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{post.user?.name || 'Anonymous'}</span>
              <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              {isEdited && (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm ml-1">Edited</span>
              )}
            </div>
          </div>
        </div>
        
        {isOwner && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground -mt-1 -mr-2 focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                <Pencil className="h-4 w-4 mr-2" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent className="pt-2">
        {isEditing ? (
          <div className="space-y-4">
            <Input 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Post Title"
              className="font-bold text-lg"
              disabled={isSubmittingEdit}
            />
            <Textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Post content..."
              className="min-h-[120px] resize-none"
              disabled={isSubmittingEdit}
            />
            
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-medium">Images</span>
              
              <div className="flex flex-wrap gap-3">
                {currentImageUrls.map((url, idx) => (
                  <div key={idx} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Current image" className="h-24 w-24 rounded-md object-cover border border-border" />
                    <button 
                      type="button" 
                      onClick={() => removeCurrentImageUrl(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {editFiles.map((file, idx) => (
                  <div key={idx} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="New upload preview" className="h-24 w-24 rounded-md object-cover border border-border" />
                    <button 
                      type="button" 
                      onClick={() => removeEditFile(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {currentImageUrls.length + editFiles.length < 10 && (
                <div className="mt-2">
                  <input 
                    type="file" 
                    id={`edit-image-${post.id}`}
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={handleEditFileChange}
                    disabled={isSubmittingEdit}
                  />
                  <label htmlFor={`edit-image-${post.id}`}>
                    <Button variant="outline" size="sm" type="button" className="text-muted-foreground gap-2" asChild disabled={isSubmittingEdit}>
                      <span><ImagePlus className="h-4 w-4" /> Add Images</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSubmittingEdit}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={isSubmittingEdit || !editTitle.trim() || !editContent.trim()}>
                {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            {existingImages.length > 0 && (
              <div className="mt-4">
                {existingImages.length === 1 ? (
                  <div className="rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existingImages[0]} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
                    {existingImages.map((url: string, index: number) => (
                      <div key={index} className="flex-shrink-0 w-[85%] sm:w-[70%] snap-center rounded-lg overflow-hidden border border-border relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`${post.title} - Image ${index + 1}`} className="w-full h-64 sm:h-80 object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                          {index + 1} / {existingImages.length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {!isEditing && (
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
      )}
    </Card>
  );
}
