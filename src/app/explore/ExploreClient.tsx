'use client';

import React, { useState, useEffect } from 'react';
import { LocationData } from '@/types';
import { GemCard } from '@/components/shared/GemCard';
import { Input } from '@/components/ui/input';
import { Search, Map, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { District, LocationCategory, CrowdLevel } from '@/types';

const DISTRICTS: District[] = ['SINDHUDURG', 'RATNAGIRI', 'RAIGAD'];
const CATEGORIES: LocationCategory[] = ['BEACH', 'WATERFALL', 'FORT', 'TEMPLE', 'VIEWPOINT', 'TRAIL', 'EATERY', 'OTHER'];
const CROWD_LEVELS: CrowdLevel[] = ['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH'];

import { useSearchParams } from 'next/navigation';

export function ExploreClient({ locations }: { locations: LocationData[] }) {
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<District | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'ALL'>('ALL');
  const [selectedCrowd, setSelectedCrowd] = useState<CrowdLevel | 'ALL'>('ALL');

  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get('query');
      if (query !== null) {
        setSearchQuery(query);
      }
      
      const category = searchParams.get('category');
      if (category && CATEGORIES.includes(category as LocationCategory)) {
        setSelectedCategory(category as LocationCategory);
      }
    }
  }, [searchParams]);

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'ALL' || loc.district === selectedDistrict;
    const matchesCategory = selectedCategory === 'ALL' || loc.category === selectedCategory;
    const matchesCrowd = selectedCrowd === 'ALL' || loc.crowdLevel === selectedCrowd;
    
    return matchesSearch && matchesDistrict && matchesCategory && matchesCrowd;
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Section */}
      <div className="bg-surface border-b border-surface-variant sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold font-headline-md text-on-surface mb-4">
                Explore Hidden Gems
              </h1>
              <div className="relative flex items-center w-full max-w-md">
                <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for waterfalls, beaches..."
                  className="pl-10 rounded-full bg-surface-container border-none shadow-sm h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full shadow-sm gap-2" asChild>
                <Link href="/map">
                  <Map className="w-4 h-4" />
                  Map View
                </Link>
              </Button>
              <Button variant="secondary" className="rounded-full shadow-sm gap-2 md:hidden">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters - Desktop & Tablet */}
          <div className="hidden md:flex flex-col gap-3 mt-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-muted-foreground min-w-fit">District:</span>
              <Badge 
                variant={selectedDistrict === 'ALL' ? 'default' : 'secondary'}
                className="cursor-pointer rounded-full px-4 py-1.5"
                onClick={() => setSelectedDistrict('ALL')}
              >
                All
              </Badge>
              {DISTRICTS.map(d => (
                <Badge 
                  key={d}
                  variant={selectedDistrict === d ? 'default' : 'outline'}
                  className="cursor-pointer rounded-full px-4 py-1.5 whitespace-nowrap bg-surface-container"
                  onClick={() => setSelectedDistrict(d)}
                >
                  {d}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-muted-foreground min-w-fit">Category:</span>
              <Badge 
                variant={selectedCategory === 'ALL' ? 'default' : 'secondary'}
                className="cursor-pointer rounded-full px-4 py-1.5"
                onClick={() => setSelectedCategory('ALL')}
              >
                All
              </Badge>
              {CATEGORIES.map(c => (
                <Badge 
                  key={c}
                  variant={selectedCategory === c ? 'default' : 'outline'}
                  className="cursor-pointer rounded-full px-4 py-1.5 whitespace-nowrap bg-surface-container"
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-medium text-muted-foreground min-w-fit">Crowd Level:</span>
              <Badge 
                variant={selectedCrowd === 'ALL' ? 'default' : 'secondary'}
                className="cursor-pointer rounded-full px-4 py-1.5"
                onClick={() => setSelectedCrowd('ALL')}
              >
                All
              </Badge>
              {CROWD_LEVELS.map(cl => (
                <Badge 
                  key={cl}
                  variant={selectedCrowd === cl ? 'default' : 'outline'}
                  className="cursor-pointer rounded-full px-4 py-1.5 whitespace-nowrap bg-surface-container"
                  onClick={() => setSelectedCrowd(cl)}
                >
                  {cl.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredLocations.length}</span> places
          </p>
        </div>

        {filteredLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLocations.map(location => (
              <GemCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No places found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-full"
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('ALL');
                setSelectedCategory('ALL');
                setSelectedCrowd('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
