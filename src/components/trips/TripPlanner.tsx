'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Calendar, Clock, ChevronRight } from 'lucide-react';
import { TripLocationData } from '@/types';

export function TripPlanner({ trips }: { trips: any[] }) {
  // Trips now include locations directly in our DB schema via trip.locations (which includes location)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Trip Card */}
        <Card className="flex flex-col items-center justify-center h-full min-h-[300px] border-dashed border-2 border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group">
          <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2 text-xl">Plan a New Trip</CardTitle>
          <CardDescription className="text-center px-6">
            Create a custom itinerary with your favorite hidden gems
          </CardDescription>
          <Button className="mt-6" variant="outline">Create Trip</Button>
        </Card>

        {/* Existing Trips */}
        {trips.map((trip) => (
          <Card key={trip.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{trip.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {trip.locations.length} STOPS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div className="flex flex-col">
                {trip.locations.map((tripLoc: any, idx: number) => {
                  const location = tripLoc.location;
                  if (!location) return null;
                  
                  return (
                    <div key={tripLoc.id} className="flex items-start p-4 border-b last:border-b-0 relative">
                      {idx !== trip.locations.length - 1 && (
                        <div className="absolute left-6 top-10 bottom-0 w-[2px] bg-border -z-10" />
                      )}
                      <div className="bg-background border-2 border-primary w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10 shadow-sm shrink-0">
                        <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-sm">{location.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {tripLoc.notes || 'No notes'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/10 border-t flex justify-between items-center mt-auto">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Calendar className="w-4 h-4" />
                Updated {new Date(trip.updatedAt).toLocaleDateString()}
              </div>
              <Button size="sm" className="gap-2">
                Open Itinerary <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
