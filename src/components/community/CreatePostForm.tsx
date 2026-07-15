"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { createCommunityPostAction } from '@/actions/community';
import { toast } from 'sonner';
import { getPresignedUrlAction } from '@/actions/storage';
import { useRouter } from 'next/navigation';

export function CreatePostForm({ currentUserId }: { currentUserId?: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 10)); // max 10 images
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast.error('Please log in to publish a post.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    let imageUrls: string[] = [];

    try {
      if (files.length > 0) {
        for (const file of files) {
          const presignedResult = await getPresignedUrlAction({
            fileType: file.type,
            fileSize: file.size,
            folder: 'community',
          });

          if (!presignedResult.success || !presignedResult.data) {
            throw new Error(presignedResult.error?.message || `Failed to get upload URL for ${file.name}`);
          }

          const { presignedUrl, publicUrl } = presignedResult.data;
          const uploadRes = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });
          
          if (!uploadRes.ok) throw new Error(`Image upload failed for ${file.name}: ${uploadRes.statusText}`);
          imageUrls.push(publicUrl);
        }
      }

      const res = await createCommunityPostAction({ title, content, imageUrls });
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create post');
      }

      toast.success('Post created successfully!');
      setTitle('');
      setContent('');
      setFiles([]);
      
      // Refresh the page data
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card overflow-hidden">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <Input 
            placeholder="Post Title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            disabled={isSubmitting}
          />
          <Textarea 
            placeholder="What's on your mind? Share an experience, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none bg-background/50 border-input"
            disabled={isSubmitting}
          />
          
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="Upload preview" className="h-24 w-24 rounded-md object-cover border border-border" />
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)} 
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border/40 py-3 flex justify-between items-center">
          <div>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              multiple
              className="hidden" 
              onChange={handleFileChange}
              disabled={isSubmitting || files.length >= 10}
            />
            <label htmlFor="image-upload">
              <Button variant="ghost" size="sm" type="button" className="text-muted-foreground gap-2" asChild disabled={!currentUserId || isSubmitting || files.length >= 10}>
                <span><ImagePlus className="h-4 w-4" /> Add Images</span>
              </Button>
            </label>
          </div>
          <Button type="submit" disabled={!currentUserId || isSubmitting || !title.trim() || !content.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {currentUserId ? 'Publish Post' : 'Login to Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
