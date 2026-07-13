"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Link as LinkIcon, Share2 } from 'lucide-react';
import { LocationData } from '@/types';
import { LocationShareCard } from './LocationShareCard';
import { exportComponentAsPNG } from '@/lib/exportImage';
import { toast } from 'sonner';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
}

export function ShareLocationModal({ isOpen, onClose, location }: ShareLocationModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState('');
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setHasNativeShare(!!navigator.share);
  }, [isOpen]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      await document.fonts.ready;
      
      // Give it a tiny bit of time to ensure layout is settled and images are painted
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const fileName = `${location.slug}-localatlas`;
      await exportComponentAsPNG(cardRef.current, { fileName, pixelRatio: 2 });
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: location.name,
          text: `Check out ${location.name} on LocalAtlas`,
          url: url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          handleCopyLink();
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-[90vw] p-6 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share this Hidden Gem</DialogTitle>
          <DialogDescription>
            Download a beautiful card or share the link with your friends.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto" style={{ width: '270px', height: '480px' }}>
          <div className="absolute top-0 left-0" style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '540px', height: '960px' }}>
            <LocationShareCard location={location} url={url} ref={cardRef} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button onClick={handleDownload} disabled={isExporting} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>

          {hasNativeShare ? (
            <Button variant="outline" onClick={handleNativeShare} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share...
            </Button>
          ) : (
            <Button variant="outline" onClick={handleCopyLink} className="w-full">
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
