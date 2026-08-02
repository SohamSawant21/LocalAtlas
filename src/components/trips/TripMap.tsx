'use client';

import dynamic from 'next/dynamic';
import { TripLocationData } from '@/types';
import { MapPin } from 'lucide-react';

const TripMapComponent = dynamic(
  () => import('./TripMapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/30 rounded-2xl border">
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <MapPin className="w-8 h-8" />
          <p>Loading itinerary map...</p>
        </div>
      </div>
    )
  }
);

interface TripMapProps {
  locations: TripLocationData[];
}

export function TripMap({ locations }: TripMapProps) {
  return <TripMapComponent locations={locations} />;
}
