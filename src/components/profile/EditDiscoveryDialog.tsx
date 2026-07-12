'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { District, LocationCategory, Difficulty, CrowdLevel, RoadCondition, Season, LocationData } from '@/types';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { editLocationAction } from '@/actions/locations';
import { getPresignedUrlAction } from '@/actions/storage';
import { toast } from 'sonner';
import Image from 'next/image';

interface EditDiscoveryDialogProps {
  location: LocationData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDiscoveryDialog({ location, open, onOpenChange }: EditDiscoveryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: location.name,
    district: location.district as District,
    category: location.category as LocationCategory,
    description: location.description,
    latitude: location.latitude,
    longitude: location.longitude,
    difficulty: location.difficulty as Difficulty,
    crowdLevel: location.crowdLevel as CrowdLevel,
    roadCondition: location.roadCondition as RoadCondition,
    bestSeason: location.bestSeason as Season,
    tags: location.tags ? location.tags.join(', ') : '',
    newImages: [] as File[],
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>(location.images || []);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalImageUrls = [...previewUrls]; // Keep existing ones by default

      if (formData.newImages.length > 0) {
        const publicUrls: string[] = [];
        for (const file of formData.newImages) {
          const presignedRes = await getPresignedUrlAction({
            fileType: file.type,
            fileSize: file.size,
            folder: 'locations',
          });

          if (!presignedRes.success || !presignedRes.data) {
            throw new Error(`Failed to get upload URL for ${file.name}`);
          }

          const { presignedUrl, publicUrl } = presignedRes.data;

          try {
            const uploadRes = await fetch(presignedUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            if (!uploadRes.ok) {
              throw new Error(`Upload failed for ${file.name}`);
            }
            publicUrls.push(publicUrl);
          } catch (uploadError: any) {
            console.warn(`Failed to upload to S3, falling back to Base64: ${uploadError.message}`);
            // Fallback to base64 string for local development without S3
            const base64Url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            publicUrls.push(base64Url);
          }
        }
        
        // If we uploaded new images, replace all existing previews/images completely as per requirements
        finalImageUrls = publicUrls;
      }

      const response = await editLocationAction({
        id: location.id,
        name: formData.name,
        district: formData.district,
        category: formData.category,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        difficulty: formData.difficulty,
        crowdLevel: formData.crowdLevel,
        roadCondition: formData.roadCondition,
        bestSeason: formData.bestSeason,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      });

      if (response.success) {
        toast.success('Discovery updated successfully!');
        onOpenChange(false);
      } else {
        toast.error(response.error?.message || 'Failed to update.');
      }
    } catch (e: any) {
      toast.error(e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Discovery</DialogTitle>
          <DialogDescription>
            Update the details of your discovery. Changes will be visible immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Location Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. Secret Waterfall"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>District</Label>
              <Select value={formData.district} onValueChange={(val) => updateFormData({ district: val as District })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINDHUDURG">Sindhudurg</SelectItem>
                  <SelectItem value="RATNAGIRI">Ratnagiri</SelectItem>
                  <SelectItem value="RAIGAD">Raigad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(val) => updateFormData({ category: val as LocationCategory })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEACH">Beach</SelectItem>
                  <SelectItem value="WATERFALL">Waterfall</SelectItem>
                  <SelectItem value="FORT">Fort</SelectItem>
                  <SelectItem value="TEMPLE">Temple</SelectItem>
                  <SelectItem value="VIEWPOINT">Viewpoint</SelectItem>
                  <SelectItem value="HOMESTAY">Homestay</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Tell us about this place..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lat">Latitude</Label>
              <Input id="edit-lat" type="number" value={formData.latitude} onChange={(e) => updateFormData({ latitude: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lng">Longitude</Label>
              <Input id="edit-lng" type="number" value={formData.longitude} onChange={(e) => updateFormData({ longitude: parseFloat(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(val) => updateFormData({ difficulty: val as Difficulty })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MODERATE">Moderate</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Crowd Level</Label>
              <Select value={formData.crowdLevel} onValueChange={(val) => updateFormData({ crowdLevel: val as CrowdLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERY_LOW">Very Low</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="VERY_HIGH">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Road Condition</Label>
              <Select value={formData.roadCondition} onValueChange={(val) => updateFormData({ roadCondition: val as RoadCondition })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                  <SelectItem value="OFFROAD">Offroad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Best Season</Label>
              <Select value={formData.bestSeason} onValueChange={(val) => updateFormData({ bestSeason: val as Season })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONSOON">Monsoon</SelectItem>
                  <SelectItem value="WINTER">Winter</SelectItem>
                  <SelectItem value="SUMMER">Summer</SelectItem>
                  <SelectItem value="ALL_YEAR">All Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input
              id="edit-tags"
              placeholder="e.g. peaceful, sunset view"
              value={formData.tags}
              onChange={(e) => updateFormData({ tags: e.target.value })}
            />
          </div>
          <div className="space-y-2 pt-2">
            <Label>Images</Label>
            {previewUrls.length > 0 && formData.newImages.length === 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border">
                    <Image src={url} alt={`Image ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {formData.newImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.newImages.map((file, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border">
                    <Image src={URL.createObjectURL(file)} alt={`New Image ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center bg-muted/20 relative mt-2">
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Upload New Images</p>
              <p className="text-xs text-muted-foreground mb-4">Replaces existing images (Max 5, 5MB each)</p>
              <div className="relative">
                <Input type="file" multiple accept="image/jpeg,image/png,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    const maxImages = 5;

                    const validFiles = files.filter(f => validMimes.includes(f.type) && f.size <= maxSize);
                    if (validFiles.length !== files.length) {
                      toast.error("Some files were skipped. Only JPEG, PNG, and WEBP under 5MB are allowed.");
                    }
                    
                    let newImages = validFiles;
                    if (newImages.length > maxImages) {
                      toast.error(`Maximum ${maxImages} images allowed.`);
                      newImages = newImages.slice(0, maxImages);
                    }
                    
                    updateFormData({ newImages });
                  }
                }} />
                <Button variant="secondary" size="sm">Select Files</Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
