'use client';

import dynamic from 'next/dynamic';
import { LocationData } from '@/types';
import { MapPin } from 'lucide-react';

const InteractiveMap = dynamic(
  () => import('./InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <MapPin className="w-8 h-8" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

interface MapProps {
  locations: LocationData[];
}

export function Map({ locations }: MapProps) {
  return <InteractiveMap locations={locations} />;
}
