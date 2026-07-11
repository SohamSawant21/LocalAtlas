'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '@/types';
import { Input } from '@/components/ui/input';
import { MapPin, Search, List, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { District, LocationCategory } from '@/types';
import Image from 'next/image';
import { Map } from '@/components/map/Map';
import { useMapStore } from '@/store';

const DISTRICTS: District[] = ['SINDHUDURG', 'RATNAGIRI', 'RAIGAD'];
const CATEGORIES: LocationCategory[] = ['BEACH', 'WATERFALL', 'FORT', 'TEMPLE', 'VIEWPOINT', 'OTHER'];

export function MapClient({ initialLocations: locations }: { initialLocations: LocationData[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'ALL'>('ALL');
  
  const selectedLocationId = useMapStore(state => state.selectedLocationId);
  const selectLocation = useMapStore(state => state.selectLocation);
  
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedLocationId && listRefs.current[selectedLocationId]) {
      listRefs.current[selectedLocationId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedLocationId]);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'ALL' || loc.district === selectedDistrict;
    const matchesCategory = selectedCategory === 'ALL' || loc.category === selectedCategory;
    return matchesSearch && matchesDistrict && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden relative">
      {/* Sidebar / List Panel */}
      <div className="w-full md:w-[400px] flex flex-col bg-surface border-t md:border-t-0 md:border-r border-surface-variant h-[50vh] md:h-full z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:shadow-xl shrink-0">
        <div className="p-4 border-b border-surface-variant space-y-4 shrink-0">
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
              aria-label="Search places"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              className="bg-surface-container border border-surface-variant text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value as District | 'ALL')}
              aria-label="Filter by district"
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
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filteredLocations.length} places found
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredLocations.map(location => {
              const isSelected = selectedLocationId === location.id;
              return (
                <div 
                  key={location.id}
                  ref={el => { listRefs.current[location.id] = el; }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-surface-variant bg-surface hover:border-primary/50'
                  }`}
                  onClick={() => selectLocation(location.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectLocation(location.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={location.images[0] || '/placeholder.jpg'}
                        alt={`Image of ${location.name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{location.name}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {location.district}
                      </div>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {location.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex gap-1 items-center" aria-label={`Rating ${location.hiddenScore}`}>
                          ★ {location.hiddenScore}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative overflow-hidden min-h-[50vh] md:min-h-0">
        <Map locations={filteredLocations} />
      </div>
    </div>
  );
}
