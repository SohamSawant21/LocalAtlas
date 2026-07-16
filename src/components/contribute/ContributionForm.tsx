'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ContributionFormData, District, LocationCategory, Difficulty, CrowdLevel, RoadCondition, Season } from '@/types';
import { UploadCloud, CheckCircle2, MapPin, Map, Loader2 } from 'lucide-react';
import { submitContributionAction } from '@/actions/locations';
import { getPresignedUrlAction } from '@/actions/storage';
import { toast } from 'sonner';
import { LocationPickerMap } from '@/components/contribute/LocationPickerMap';

const STEPS = ['Basic Details', 'Location & Features', 'Media Upload', 'Review'];

export function ContributionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ContributionFormData>>({
    name: '',
    district: 'SINDHUDURG',
    category: 'OTHER',
    description: '',
    latitude: 0,
    longitude: 0,
    difficulty: 'EASY',
    crowdLevel: 'LOW',
    roadCondition: 'GOOD',
    bestSeason: 'ALL_YEAR',
    tags: [],
    images: [],
    coverImageIndex: 0,
  });

  const updateFormData = (data: Partial<ContributionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const publicUrls: string[] = [];

      if (formData.images && formData.images.length > 0) {
        let filesToUpload = [...formData.images];
        if (formData.coverImageIndex !== undefined && formData.coverImageIndex > 0 && formData.coverImageIndex < filesToUpload.length) {
          const coverFile = filesToUpload.splice(formData.coverImageIndex, 1)[0];
          filesToUpload.unshift(coverFile);
        }
        for (const file of filesToUpload) {
          const presignedRes = await getPresignedUrlAction({
            fileType: file.type,
            fileSize: file.size,
            folder: 'locations',
          });

          if (!presignedRes.success || !presignedRes.data) {
            throw new Error(`Failed to get upload URL for ${file.name}`);
          }

          const { presignedUrl, publicUrl } = presignedRes.data;

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
        }
      }

      const response = await submitContributionAction({
        name: formData.name || '',
        district: formData.district || 'SINDHUDURG',
        category: formData.category || 'OTHER',
        description: formData.description || '',
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        difficulty: formData.difficulty || 'EASY',
        crowdLevel: formData.crowdLevel || 'LOW',
        roadCondition: formData.roadCondition || 'GOOD',
        bestSeason: formData.bestSeason || 'ALL_YEAR',
        entryFee: formData.entryFee,
        parking: formData.parking,
        network: formData.network,
        accessibility: formData.accessibility,
        sunset: formData.sunset,
        images: publicUrls,
      });

      if (response.success) {
        toast.success('Contribution submitted successfully!');
        setShowConfirm(false);
        setCurrentStep(0);
        setFormData({
          name: '', district: 'SINDHUDURG', category: 'OTHER', description: '', latitude: 0, longitude: 0, difficulty: 'EASY', crowdLevel: 'LOW', roadCondition: 'GOOD', bestSeason: 'ALL_YEAR', tags: [], images: [], coverImageIndex: 0
        });
      } else {
        toast.error(response.error?.message || 'Failed to submit.');
      }
    } catch (e: any) {
      toast.error(e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Contribute a Location</h2>
        <div className="flex justify-between items-center mt-6 relative">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 z-10 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors
                  ${idx <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {idx + 1}
              </div>
              <span className="text-xs font-medium text-muted-foreground hidden sm:block">{step}</span>
            </div>
          ))}
          <div className="absolute top-4 left-0 h-[2px] bg-muted w-full -z-0">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g. Secret Waterfall"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about this place..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 mb-6">
              <Label>Select Location on Map</Label>
              <LocationPickerMap
                latitude={formData.latitude || 0}
                longitude={formData.longitude || 0}
                onChange={(lat, lng, addressDetails) => {
                  const updates: Partial<any> = { latitude: lat, longitude: lng };
                  if (addressDetails) {
                    const district = (addressDetails.state_district || addressDetails.county || '').toUpperCase();
                    if (district.includes('SINDHUDURG')) updates.district = 'SINDHUDURG';
                    else if (district.includes('RATNAGIRI')) updates.district = 'RATNAGIRI';
                    else if (district.includes('RAIGAD')) updates.district = 'RAIGAD';
                  }
                  updateFormData(updates);
                }}
                category={formData.category}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entry Fee (Optional)</Label>
                <Input placeholder="e.g. ₹50 per person" value={formData.entryFee || ''} onChange={(e) => updateFormData({ entryFee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Parking (Optional)</Label>
                <Input placeholder="e.g. Paid parking available" value={formData.parking || ''} onChange={(e) => updateFormData({ parking: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Network Coverage (Optional)</Label>
                <Input placeholder="e.g. Good Jio network, no Airtel" value={formData.network || ''} onChange={(e) => updateFormData({ network: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Accessibility (Optional)</Label>
                <Input placeholder="e.g. 10 min walk from road" value={formData.accessibility || ''} onChange={(e) => updateFormData({ accessibility: e.target.value })} />
              </div>
            </div>
            {(formData.category === 'BEACH' || formData.category === 'VIEWPOINT') && (
              <div className="space-y-2">
                <Label>Sunset Point (Optional)</Label>
                <Input placeholder="e.g. Great sunset views after 6 PM" value={formData.sunset || ''} onChange={(e) => updateFormData({ sunset: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">Upload Images</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop your high-quality images here</p>
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
                    
                    updateFormData({ images: newImages });
                  }
                }} />
                <Button variant="secondary">Select Files</Button>
              </div>
              {formData.images && formData.images.length > 0 && (
                <div className="w-full mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-left">Selected Images (Choose one as Cover)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images.map((file, idx) => (
                      <div key={idx} className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${formData.coverImageIndex === idx ? 'border-primary' : 'border-transparent'}`} onClick={() => updateFormData({ coverImageIndex: idx })}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover" />
                        {formData.coverImageIndex === idx && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">Cover</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 text-primary">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="font-semibold text-lg">Review your contribution</h3>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="text-muted-foreground">Name:</div>
                <div className="font-medium">{formData.name || 'Not provided'}</div>
                <div className="text-muted-foreground">District:</div>
                <div className="font-medium">{formData.district}</div>
                <div className="text-muted-foreground">Category:</div>
                <div className="font-medium">{formData.category}</div>
                <div className="text-muted-foreground">Coordinates:</div>
                <div className="font-medium">{formData.latitude}, {formData.longitude}</div>
                <div className="text-muted-foreground">Images:</div>
                <div className="font-medium">{formData.images?.length || 0} attached</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentStep === STEPS.length - 1 ? 'Submit Contribution' : 'Continue'}
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Contribution</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this location? It will be reviewed by moderators before being published.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Yes, Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
