'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Locate, Navigation, Maximize, Layers } from 'lucide-react';
import { useMapStore } from '@/store';
import { toast } from 'sonner';
import type L from 'leaflet';

interface MapControlsProps {
  map: L.Map | null;
}

export function MapControls({ map }: MapControlsProps) {
  const { setCurrentLocation, setMapStyle, mapStyle } = useMapStore();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported: Your browser does not support geolocation.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        if (map) map.flyTo([latitude, longitude], 13);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Failed to get location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied.';
        }
        toast.error(`Location Error: ${msg}`);
      }
    );
  };

  const toggleFullscreen = () => {
    if (!map) return;
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        toast.error('Fullscreen error: Could not enter fullscreen mode.');
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleStyle = () => {
    setMapStyle(mapStyle === 'terrain' ? 'satellite' : 'terrain');
  };

  const resetBearing = () => {
    // Basic Leaflet doesn't support rotation/bearing natively without plugins,
    // so we just reset zoom/center to a default for now.
    if (map) map.flyTo([16.5, 73.3], 9);
  };

  return (
    <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-[1000] leaflet-control-custom">
      <Button 
        variant="secondary" 
        size="icon" 
        className="rounded-full shadow-lg h-10 w-10 bg-background/90 backdrop-blur"
        onClick={handleLocateMe}
        disabled={isLocating}
      >
        <Locate className={`w-5 h-5 ${isLocating ? 'animate-pulse text-primary' : ''}`} />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="rounded-full shadow-lg h-10 w-10 bg-background/90 backdrop-blur"
        onClick={resetBearing}
      >
        <Navigation className="w-5 h-5" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="rounded-full shadow-lg h-10 w-10 bg-background/90 backdrop-blur"
        onClick={toggleStyle}
      >
        <Layers className="w-5 h-5" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="rounded-full shadow-lg h-10 w-10 bg-background/90 backdrop-blur"
        onClick={toggleFullscreen}
      >
        <Maximize className="w-5 h-5" />
      </Button>
    </div>
  );
}
