'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Calendar, Clock, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { TripLocationData } from '@/types';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useTransition } from 'react';
import { createTripAction, deleteTripAction } from '@/actions/trips';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function TripPlanner({ trips }: { trips: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Trip name is required');
      return;
    }
    startTransition(async () => {
      const result = await createTripAction({ name, description });
      if (result.success) {
        toast.success('Trip created!');
        setIsOpen(false);
        setName('');
        setDescription('');
        router.refresh();
      } else {
        toast.error(result.error?.message || 'Failed to create trip');
      }
    });
  };

  const handleDelete = () => {
    if (!tripToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteTripAction(tripToDelete);
      if (result.success) {
        toast.success('Trip deleted successfully');
        setTripToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error?.message || 'Failed to delete trip');
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Trip Card */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Card 
            className="flex flex-col items-center justify-center h-full min-h-[300px] border-dashed border-2 border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mb-2 text-xl">Plan a New Trip</CardTitle>
              <CardDescription className="text-center px-6">
                Create a custom itinerary with your favorite hidden gems
              </CardDescription>
              <Button className="mt-6" variant="outline" asChild>
                <span>Create Trip</span>
              </Button>
          </Card>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription>
                Start planning your next adventure. You can add places to this trip as you explore.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input id="name" placeholder="e.g., Weekend Getaway to Konkan" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" placeholder="What is this trip about?" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isPending} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Trip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Trip</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this trip? This action cannot be undone and will remove all saved locations and notes from this itinerary.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTripToDelete(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Existing Trips */}
        {trips.map((trip) => (
          <Card key={trip.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{trip.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="font-mono text-xs whitespace-nowrap">
                    {trip.locations.length} STOPS
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setTripToDelete(trip.id)}
                    title="Delete Trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
              <Button size="sm" className="gap-2" asChild>
                <Link href={`/trips/${trip.id}`}>
                  Open Itinerary <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
