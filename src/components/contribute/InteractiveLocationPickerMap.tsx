'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, Loader2, MapPin, Search, AlertTriangle, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { createCustomIcon } from '@/lib/maps/markers';
import { LocationCategory } from '@/types';
import { checkNearbyLocationsAction } from '@/actions/locations';
import Link from 'next/link';

// Default center: Sindhudurg region approximately
const DEFAULT_CENTER: [number, number] = [16.1437, 73.5709];
const DEFAULT_ZOOM = 9;

interface InteractiveLocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, addressDetails?: any) => void;
  category?: LocationCategory;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function MapFlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
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

  // Only fly to position on initial load, not on every click
  const isInitial = useRef(true);
  useEffect(() => {
    if (position && position[0] !== 0 && position[1] !== 0 && isInitial.current) {
      map.flyTo(position, map.getZoom(), { duration: 1.5 });
      isInitial.current = false;
    }
  }, [map, position]);

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
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);

  // Address and Nearby State
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  const position: [number, number] | null = latitude && longitude ? [latitude, longitude] : null;
  const initialCenter = position && position[0] !== 0 && position[1] !== 0 ? position : DEFAULT_CENTER;

  // Search logic
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      setIsSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearchQuery)}&limit=5`, {
        headers: { 'Accept-Language': 'en' }
      })
      .then(res => res.json())
      .then(data => {
        setSearchResults(data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSelectSearchResult = (result: any) => {
    setSearchCenter([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  // Duplicate Check logic
  const checkNearby = async (lat: number, lng: number) => {
    const res = await checkNearbyLocationsAction(lat, lng);
    if (res.success && res.data) {
      setNearbyLocations(res.data);
    }
  };

  // Reverse Geocoding
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      if (data && data.address) {
        setAddressDetails(data.address);
        onChange(lat, lng, data.address);
      } else {
        setAddressDetails(null);
        onChange(lat, lng);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      setAddressDetails(null);
      onChange(lat, lng);
    }
    
    // Trigger duplicate check
    checkNearby(lat, lng);
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
        setSearchCenter([lat, lng]); // Move map to current location
        fetchAddress(lat, lng); // Drop marker at current location
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
    <div className="flex flex-col gap-4 w-full">
      
      {/* Search Bar & Instruction */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search city, village, landmark or road..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full bg-background"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {/* Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-[100] w-full mt-1 bg-popover border shadow-md rounded-md max-h-60 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <div 
                    key={i} 
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm border-b last:border-0"
                    onClick={() => handleSelectSearchResult(res)}
                  >
                    {res.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleLocateMe}
            disabled={isLocating}
            className="shrink-0"
          >
            {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
            Use Current Location
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          <Navigation className="w-4 h-4 inline mr-1 -mt-0.5" />
          Search to navigate quickly, then place the pin on the exact location.
        </p>
      </div>
      
      {/* Map Container */}
      <div className="w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden border border-border relative z-0 shadow-sm">
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
          <MapFlyTo center={searchCenter} zoom={13} />
        </MapContainer>
      </div>

      {/* Map Information display */}
      <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground font-medium mr-2">Latitude:</span>
            {latitude ? latitude.toFixed(6) : '-'}
          </div>
          <div>
            <span className="text-muted-foreground font-medium mr-2">Longitude:</span>
            {longitude ? longitude.toFixed(6) : '-'}
          </div>
        </div>
        
        {addressDetails && (
          <div className="pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground font-medium mr-2">Village/Town:</span>
              <span className="font-medium">{addressDetails.village || addressDetails.town || addressDetails.city || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium mr-2">District:</span>
              <span className="font-medium">{addressDetails.state_district || addressDetails.county || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium mr-2">State:</span>
              <span className="font-medium">{addressDetails.state || '-'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Warning */}
      {nearbyLocations.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            Possible nearby places
          </div>
          <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-400">
            {nearbyLocations.map((loc) => (
              <li key={loc.id} className="flex items-center gap-2">
                <span>• {loc.name} ({Math.round(loc.distance)} m)</span>
                <Link href={`/location/${loc.slug}`} target="_blank" className="text-primary hover:underline ml-auto text-xs">
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
