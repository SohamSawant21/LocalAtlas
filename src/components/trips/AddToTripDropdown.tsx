'use client';

import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Map, Plus, Loader2 } from 'lucide-react';
import { getUserTripsAction, addLocationToTripAction } from '@/actions/trips';
import { toast } from 'sonner';

export function AddToTripDropdown({ locationId }: { locationId: string }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await getUserTripsAction();
      if (res.success && res.data) {
        setTrips(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToTrip = async (tripId: string) => {
    setIsAdding(true);
    try {
      const res = await addLocationToTripAction({ tripId, locationId });
      if (res.success) {
        toast.success('Added to trip!');
      } else {
        toast.error(res.error?.message || 'Failed to add to trip');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchTrips(); }}>
      <DropdownMenuTrigger 
        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors text-on-surface hover:text-primary hover:bg-white border-none outline-none focus:outline-none focus:ring-0"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        title="Add to Trip"
      >
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Add to Trip</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 text-sm text-muted-foreground flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
          </div>
        ) : trips.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No trips found
          </div>
        ) : (
          trips.map((trip) => (
            <DropdownMenuItem key={trip.id} onSelect={() => handleAddToTrip(trip.id)} className="cursor-pointer">
              {trip.name}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-primary"
          onSelect={() => window.location.href = '/trips'}
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Trip
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
