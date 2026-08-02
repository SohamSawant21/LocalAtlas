'use client';

import React, { useState, useTransition } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Map, Plus, Loader2 } from 'lucide-react';
import { getUserTripsAction, addLocationToTripAction, createTripAction } from '@/actions/trips';
import { toast } from 'sonner';

export function AddToTripDropdown({ locationId }: { locationId: string }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [isCreating, startTransition] = useTransition();

  const handleCreateAndAdd = () => {
    if (!newTripName.trim()) {
      toast.error('Trip name is required');
      return;
    }
    
    startTransition(async () => {
      // 1. Create trip
      const createRes = await createTripAction({ name: newTripName, description: '' });
      if (!createRes.success || !createRes.data) {
        toast.error(createRes.error?.message || 'Failed to create trip');
        return;
      }
      
      const newTripId = createRes.data.id;
      
      // 2. Add location to trip
      const addRes = await addLocationToTripAction({ tripId: newTripId, locationId });
      if (addRes.success) {
        toast.success(`Created "${newTripName}" and added location!`);
        setIsCreateModalOpen(false);
        setNewTripName('');
        fetchTrips(); // Refresh the list
      } else {
        toast.error(addRes.error?.message || 'Trip created, but failed to add location');
      }
    });
  };

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
    <>
      <DropdownMenu onOpenChange={(open) => { if (open) fetchTrips(); }}>
        <DropdownMenuTrigger 
        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors text-on-surface hover:text-primary hover:bg-white border-none outline-none focus:outline-none focus:ring-0"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        title="Add to Trip"
      >
        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuGroup>
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
              <DropdownMenuItem key={trip.id} onClick={() => handleAddToTrip(trip.id)} className="cursor-pointer">
                {trip.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Trip
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Create a new trip and add this location to it instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Summer Getaway" 
              value={newTripName} 
              onChange={(e) => setNewTripName(e.target.value)} 
              disabled={isCreating} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>Cancel</Button>
          <Button onClick={handleCreateAndAdd} disabled={isCreating || !newTripName.trim()}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
