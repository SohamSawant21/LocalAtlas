'use client';

import dynamic from 'next/dynamic';
import { LocationCategory } from '@/types';
import { MapPin } from 'lucide-react';

const InteractiveLocationPickerMap = dynamic(
  () => import('./InteractiveLocationPickerMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] md:h-[400px] rounded-xl flex items-center justify-center bg-muted/30 border border-dashed border-border">
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <MapPin className="w-8 h-8" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, address?: string) => void;
  category?: LocationCategory;
}

export function LocationPickerMap(props: LocationPickerMapProps) {
  return <InteractiveLocationPickerMap {...props} />;
}
