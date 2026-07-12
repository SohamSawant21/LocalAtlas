'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { LocateFixed, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { createCustomIcon } from '@/lib/maps/markers';
import { LocationCategory } from '@/types';

// Default center: Sindhudurg region approximately
const DEFAULT_CENTER: [number, number] = [16.1437, 73.5709];
const DEFAULT_ZOOM = 9;

interface InteractiveLocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, address?: string) => void;
  category?: LocationCategory;
}

function LocationMarker({ 
  position, 
  onChange,
  category = 'OTHER'
}: { 
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
  category?: LocationCategory;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position && position[0] !== 0 && position[1] !== 0) {
      map.flyTo(position, map.getZoom(), { duration: 1.5 });
    }
  }, [map]); // We don't want to fly on every position change if the user is just clicking around, only on initial load or "Locate Me"

  const icon = createCustomIcon(category, true) || L.divIcon({
    html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    className: 'bg-transparent border-0',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });

  return position && position[0] !== 0 && position[1] !== 0 ? (
    <Marker 
      position={position} 
      icon={icon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
        }
      }}
    />
  ) : null;
}

export default function InteractiveLocationPickerMap({ 
  latitude, 
  longitude, 
  onChange,
  category
}: InteractiveLocationPickerMapProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [address, setAddress] = useState<string>('');

  const position: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;
  const initialCenter = position && position[0] !== 0 && position[1] !== 0 ? position : DEFAULT_CENTER;

  // Reverse Geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        onChange(lat, lng, data.display_name);
      } else {
        onChange(lat, lng);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      onChange(lat, lng);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    fetchAddress(lat, lng);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        fetchAddress(lat, lng);
        setIsLocating(false);
        toast.success('Location found!');
      },
      (error) => {
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable it in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out.");
            break;
          default:
            toast.error("An unknown error occurred getting location.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> 
          {address ? <span className="line-clamp-1 flex-1" title={address}>{address}</span> : 'Click on the map to select a location'}
        </div>
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={handleLocateMe}
          disabled={isLocating}
          className="shrink-0"
        >
          {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
          Use My Current Location
        </Button>
      </div>
      
      <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-border relative z-0">
        <MapContainer 
          center={initialCenter} 
          zoom={DEFAULT_ZOOM} 
          className="w-full h-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            onChange={handleMapClick} 
            category={category}
          />
        </MapContainer>
      </div>
    </div>
  );
}
