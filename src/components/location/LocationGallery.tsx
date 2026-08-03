"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationGalleryProps {
  images: string[];
  locationName: string;
}

export function LocationGallery({ images, locationName }: LocationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    if (e.key === 'Escape') setSelectedIndex(null);
    if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
  }, [selectedIndex, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe distance
    if (diff > 50) {
      setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
    } else if (diff < -50) {
      setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }
    setTouchStart(null);
  };

  if (images.length <= 1) return null;

  return (
    <div className="mt-8 pt-6 border-t">
      <h3 className="text-xl font-semibold mb-4">Gallery</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.slice(1).map((img, idx) => (
          <div 
            key={idx} 
            className="relative aspect-square rounded-xl overflow-hidden group border shadow-sm cursor-pointer bg-muted/20"
            onClick={() => setSelectedIndex(idx + 1)}
          >
            <Image 
              src={img} 
              alt={`${locationName} - Gallery image ${idx + 1}`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer Modal */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white hover:bg-white/20 rounded-full z-[110] h-10 w-10 md:h-12 md:w-12"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </Button>

          {/* Navigation Controls - Hidden on very small screens, rely on swipe */}
          {selectedIndex > 0 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-14 md:w-14 z-[110] hidden sm:flex"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => prev! - 1); }}
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </Button>
          )}

          {selectedIndex < images.length - 1 && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-14 md:w-14 z-[110] hidden sm:flex"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => prev! + 1); }}
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </Button>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full md:max-w-6xl flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              key={images[selectedIndex]} // force re-render on change for animation
              src={images[selectedIndex]} 
              alt={`${locationName} - Gallery image ${selectedIndex}`} 
              fill
              sizes="100vw"
              className="object-contain select-none animate-in zoom-in-95 duration-200 p-4 md:p-8 md:max-h-[90vh]"
              draggable={false}
            />
            
            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 text-sm md:text-base font-medium bg-black/60 px-4 py-1.5 md:py-2 rounded-full backdrop-blur-md z-[110]">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
