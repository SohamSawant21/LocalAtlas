/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, ExternalLink, MoreVertical } from 'lucide-react';
import { SaveButton } from '@/components/location/SaveButton';
import Link from 'next/link';
import Image from 'next/image';

export function SavedPlacesList({ locations, isAuthenticated = true }: { locations: any[], isAuthenticated?: boolean }) {
  if (locations.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No saved places yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">Start exploring and save places you'd like to visit later.</p>
        <Button>Explore Gems</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <Card key={location.id} className="overflow-hidden group flex flex-col">
          <div className="relative h-48 overflow-hidden">
            <Image 
              src={location.images[0] || 'https://via.placeholder.com/400x300'} 
              alt={location.name} 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <SaveButton locationId={location.id} initialSaved={true} variant="icon" isAuthenticated={isAuthenticated} />
            </div>
            <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/90">
              {location.category}
            </Badge>
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/location/${location.slug}`} className="hover:underline">
                  <CardTitle className="line-clamp-1">{location.name}</CardTitle>
                </Link>
                <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {location.district}
                </CardDescription>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2 -mt-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {location.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto border-t">
            <div className="flex justify-between items-center w-full mt-4">
              <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                Score: {location.hiddenScore}
              </div>
              <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs" asChild>
                <Link href={`/location/${location.slug}`}>
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
