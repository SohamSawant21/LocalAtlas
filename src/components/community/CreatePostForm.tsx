"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, Send } from 'lucide-react';
import { createCommunityPostAction } from '@/actions/community';
import { toast } from 'sonner';
import { getPresignedUrlAction } from '@/actions/storage';
import { useRouter } from 'next/navigation';

export function CreatePostForm({ currentUserId }: { currentUserId?: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
    let imageUrl = undefined;

    try {
      if (file) {
        const presignedResult = await getPresignedUrlAction({
          fileType: file.type,
          fileSize: file.size,
          folder: 'community',
        });

        if (!presignedResult.success || !presignedResult.data) {
          throw new Error(presignedResult.error?.message || 'Failed to get upload URL');
        }

        const { presignedUrl, publicUrl } = presignedResult.data;
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        
        if (!uploadRes.ok) throw new Error(`Image upload failed: ${uploadRes.statusText}`);
        imageUrl = publicUrl;
      }

      const res = await createCommunityPostAction({ title, content, imageUrl });
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create post');
      }

      toast.success('Post created successfully!');
      setTitle('');
      setContent('');
      setFile(null);
      
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
          
          {file && (
            <div className="relative inline-block mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt="Upload preview" className="h-32 rounded-md object-cover border border-border" />
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                &times;
              </button>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border/40 py-3 flex justify-between items-center">
          <div>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            <label htmlFor="image-upload">
              <Button variant="ghost" size="sm" type="button" className="text-muted-foreground gap-2" asChild disabled={!currentUserId || isSubmitting}>
                <span><ImagePlus className="h-4 w-4" /> Add Image</span>
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
