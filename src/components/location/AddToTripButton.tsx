'use client';

import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Map, Plus, Loader2 } from 'lucide-react';
import { getUserTripsAction, addLocationToTripAction } from '@/actions/trips';
import { toast } from 'sonner';

export function AddToTripButton({ locationId, isAuthenticated }: { locationId: string, isAuthenticated: boolean }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchTrips = async () => {
    if (!isAuthenticated) return;
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
        className="w-full rounded-xl inline-flex items-center justify-center whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-0" 
        disabled={!isAuthenticated || isAdding}
      >
        {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Map className="w-4 h-4 mr-2" />}
        Add to Trip
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Your Trips</DropdownMenuLabel>
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
