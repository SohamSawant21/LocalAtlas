"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, Send, X, MapPin, ListTodo, Plus, Trash2 } from 'lucide-react';
import { createCommunityPostAction, searchLocationsAction } from '@/actions/community';
import { toast } from 'sonner';
import { getPresignedUrlAction } from '@/actions/storage';
import { useRouter } from 'next/navigation';

export function CreatePostForm({ currentUserId }: { currentUserId?: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('QUESTION');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Location search state
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{id: string, name: string} | null>(null);

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    const search = async () => {
      if (locationSearch.length >= 2 && !selectedLocation) {
        setIsSearchingLocation(true);
        const res = await searchLocationsAction(locationSearch);
        if (res.success) setLocationResults(res.data);
        setIsSearchingLocation(false);
      } else {
        setLocationResults([]);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [locationSearch, selectedLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles].slice(0, 10)); // max 10 images
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
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

    const validPollOptions = pollOptions.filter(opt => opt.trim().length > 0);
    if (showPoll && validPollOptions.length < 2) {
      toast.error('Poll must have at least 2 valid options.');
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

      const payload = {
        title,
        content,
        imageUrls,
        category,
        locationId: selectedLocation?.id,
        pollOptions: showPoll ? validPollOptions : undefined,
      };

      const res = await createCommunityPostAction(payload);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create post');
      }

      toast.success('Post created successfully!');
      setTitle('');
      setContent('');
      setFiles([]);
      setSelectedLocation(null);
      setLocationSearch('');
      setShowPoll(false);
      setPollOptions(['', '']);
      setCategory('QUESTION');
      
      // Refresh the page data
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORIES = [
    { value: 'PLACE_RECOMMENDATION', label: "Place Recommendation" },
    { value: 'QUESTION', label: "Question" },
    { value: 'PHOTO', label: "Photo" },
    { value: 'TRAVEL_TIP', label: "Travel Tip" },
    { value: 'ALERT', label: "Alert" },
    { value: 'FESTIVAL', label: "Festival" },
    { value: 'ROUTE_UPDATE', label: "Route Update" },
    { value: 'FOOD', label: "Food" },
    { value: 'HERITAGE', label: "Heritage" },
    { value: 'MEETUP', label: "Meetup" },
  ];

  return (
    <Card className="border-border/50 bg-card overflow-visible">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 mb-2 flex-wrap">
            <select 
              className="bg-muted text-foreground text-sm rounded-md px-3 py-2 border-none outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[200px]">
              {selectedLocation ? (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-md border border-primary/20">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium truncate flex-1">{selectedLocation.name}</span>
                  <button type="button" onClick={() => { setSelectedLocation(null); setLocationSearch(''); }} className="hover:bg-primary/20 p-0.5 rounded-full">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Link to a place..."
                      className="pl-9 bg-muted border-none"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      disabled={isSubmitting}
                    />
                    {isSearchingLocation && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {locationResults.length > 0 && !selectedLocation && (
                    <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                      {locationResults.map(loc => (
                        <div 
                          key={loc.id} 
                          className="px-4 py-2 text-sm hover:bg-muted cursor-pointer flex flex-col"
                          onClick={() => setSelectedLocation(loc)}
                        >
                          <span className="font-semibold text-foreground">{loc.name}</span>
                          <span className="text-xs text-muted-foreground">{loc.district}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

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
          
          {showPoll && (
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm flex items-center gap-2"><ListTodo className="h-4 w-4"/> Poll Options</span>
                <button type="button" onClick={() => setShowPoll(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input 
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    disabled={isSubmitting}
                    className="bg-background"
                  />
                  {pollOptions.length > 2 && (
                    <Button variant="ghost" size="icon" type="button" onClick={() => removePollOption(i)} disabled={isSubmitting}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <Button variant="outline" size="sm" type="button" onClick={addPollOption} className="w-full text-xs border-dashed" disabled={isSubmitting}>
                  <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
              )}
            </div>
          )}

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
          <div className="flex gap-2">
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
            {!showPoll && (
              <Button variant="ghost" size="sm" type="button" className="text-muted-foreground gap-2 hidden sm:flex" onClick={() => setShowPoll(true)} disabled={!currentUserId || isSubmitting}>
                <ListTodo className="h-4 w-4" /> Add Poll
              </Button>
            )}
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
