'use client';

import React, { useState } from 'react';
import { LocationData } from '@/types';
import { Input } from '@/components/ui/input';
import { MapPin, Search, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { District, LocationCategory } from '@/types';
import Image from 'next/image';

const DISTRICTS: District[] = ['SINDHUDURG', 'RATNAGIRI', 'RAIGAD'];
const CATEGORIES: LocationCategory[] = ['BEACH', 'WATERFALL', 'FORT', 'TEMPLE', 'VIEWPOINT', 'OTHER'];

export function MapClient({ initialLocations: locations }: { initialLocations: LocationData[] }) {
  // Calculate map boundaries based on data to position pins relatively
  const lats = locations.map(l => l.latitude);
  const lngs = locations.map(l => l.longitude);
  const minLat = lats.length > 0 ? Math.min(...lats) - 0.1 : 0;
  const maxLat = lats.length > 0 ? Math.max(...lats) + 0.1 : 0;
  const minLng = lngs.length > 0 ? Math.min(...lngs) - 0.1 : 0;
  const maxLng = lngs.length > 0 ? Math.max(...lngs) + 0.1 : 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'ALL'>('ALL');
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'ALL' || loc.district === selectedDistrict;
    const matchesCategory = selectedCategory === 'ALL' || loc.category === selectedCategory;
    return matchesSearch && matchesDistrict && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar / List Panel */}
      <div className="w-full md:w-[400px] flex flex-col bg-surface border-r border-surface-variant h-full z-10 shadow-xl">
        <div className="p-4 border-b border-surface-variant space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-headline-md">Interactive Map</h1>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/explore">
                <List className="w-5 h-5" />
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search places..."
              className="pl-9 bg-surface-container"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              className="bg-surface-container border border-surface-variant text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value as District | 'ALL')}
            >
              <option value="ALL">All Districts</option>
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            
            <select 
              className="bg-surface-container border border-surface-variant text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as LocationCategory | 'ALL')}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredLocations.length} places found
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredLocations.map(location => (
              <div 
                key={location.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  hoveredLocationId === location.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-surface-variant bg-surface hover:border-primary/50'
                }`}
                onMouseEnter={() => setHoveredLocationId(location.id)}
                onMouseLeave={() => setHoveredLocationId(null)}
              >
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={location.images[0] || '/placeholder.jpg'}
                      alt={location.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1">{location.name}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {location.district}
                    </div>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {location.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex gap-1 items-center">
                        ★ {location.hiddenScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Map Canvas (Placeholder) */}
      <div className="flex-1 bg-blue-50/50 dark:bg-slate-900 relative overflow-hidden h-[50vh] md:h-auto">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 pointer-events-none" />
        
        {/* Placeholder Map Pins */}
        {filteredLocations.map(location => {
          // Calculate relative position based on lat/lng span
          // Note: In a real app this would use a map library projection
          const top = `${100 - ((location.latitude - minLat) / (maxLat - minLat)) * 100}%`;
          const left = `${((location.longitude - minLng) / (maxLng - minLng)) * 100}%`;
          
          const isHovered = hoveredLocationId === location.id;

          return (
            <div
              key={`pin-${location.id}`}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 cursor-pointer ${
                isHovered ? 'scale-125 z-20' : 'scale-100 hover:scale-110'
              }`}
              style={{ top, left }}
              onMouseEnter={() => setHoveredLocationId(location.id)}
              onMouseLeave={() => setHoveredLocationId(null)}
            >
              <div className="relative group">
                <MapPin 
                  className={`w-8 h-8 ${
                    isHovered ? 'text-primary fill-primary/20' : 'text-red-500 fill-red-500/20'
                  } drop-shadow-md`} 
                />
                
                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-background rounded-lg shadow-xl border border-border p-2 pointer-events-none transition-opacity duration-200 ${
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                  <p className="font-semibold text-sm line-clamp-1">{location.name}</p>
                  <p className="text-xs text-muted-foreground">{location.category}</p>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Overlay controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
          <div className="bg-background/90 backdrop-blur border border-border rounded-lg shadow-lg p-3 text-sm flex flex-col gap-2 pointer-events-none">
            <span className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Placeholder Map
            </span>
            <span className="text-muted-foreground text-xs">
              Waiting for map integration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
