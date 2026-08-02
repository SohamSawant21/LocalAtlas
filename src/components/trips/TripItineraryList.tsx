'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Edit2, Check, X, MapPin } from 'lucide-react';
import { GemCard } from '@/components/shared/GemCard';
import { updateTripLocationsOrderAction, updateTripLocationNotesAction } from '@/actions/trips';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TripMap } from './TripMap';

interface TripItineraryListProps {
  tripId: string;
  initialLocations: any[];
}

export function TripItineraryList({ tripId, initialLocations }: TripItineraryListProps) {
  const [locations, setLocations] = useState(initialLocations);
  const [isPending, startTransition] = useTransition();

  // Reset internal state if props change (e.g. after a server revalidation)
  useEffect(() => {
    setLocations(initialLocations);
  }, [initialLocations]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    // Optimistically update the UI
    const newLocations = Array.from(locations);
    const [reorderedItem] = newLocations.splice(sourceIndex, 1);
    newLocations.splice(destinationIndex, 0, reorderedItem);
    
    // Update the 'order' property to reflect new indices
    const updatedLocations = newLocations.map((loc, index) => ({
      ...loc,
      order: index,
    }));
    
    setLocations(updatedLocations);

    // Call server action to update DB
    const updates = updatedLocations.map((loc) => ({
      id: loc.id,
      order: loc.order,
    }));

    startTransition(async () => {
      const res = await updateTripLocationsOrderAction({ tripId, updates });
      if (!res.success) {
        toast.error('Failed to save the new order');
        // Revert on failure
        setLocations(initialLocations);
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/2 xl:w-5/12">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="trip-locations">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {locations.map((tripLoc, index) => (
                  <Draggable key={tripLoc.id} draggableId={tripLoc.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-card border rounded-2xl p-4 flex gap-4 ${
                          snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : 'shadow-sm'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shadow-sm border border-primary/20 self-start mt-1">
                          {index + 1}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{tripLoc.location.name}</span>
                          </div>
                          
                          <div className="max-w-[280px] sm:max-w-[320px] lg:max-w-full">
                            <GemCard location={tripLoc.location as any} />
                          </div>
                          
                          <div className="mt-4">
                            <NotesEditor tripId={tripId} tripLocationId={tripLoc.id} initialNotes={tripLoc.notes || ''} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      {/* Map View */}
      <div className="w-full lg:w-1/2 xl:w-7/12 mt-8 lg:mt-0 relative">
        <div className="sticky top-24 rounded-2xl overflow-hidden shadow-lg border h-[60vh] min-h-[400px] lg:h-[calc(100vh-140px)]">
          <TripMap locations={locations} />
        </div>
      </div>
    </div>
  );
}

function NotesEditor({ tripId, tripLocationId, initialNotes }: { tripId: string, tripLocationId: string, initialNotes: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  // Reset if external props change
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = () => {
    if (notes === initialNotes) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const res = await updateTripLocationNotesAction({ tripId, tripLocationId, notes });
      if (res.success) {
        toast.success('Notes saved');
        setIsEditing(false);
      } else {
        toast.error('Failed to save notes');
      }
    });
  };

  if (isEditing) {
    return (
      <div className="bg-muted/30 p-3 rounded-xl border space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this stop (e.g., 'Meet guide here', 'Try the seafood')"
          className="min-h-[80px] bg-background resize-none"
          disabled={isPending}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setNotes(initialNotes); setIsEditing(false); }} disabled={isPending}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 p-3 rounded-xl border group transition-colors hover:bg-muted/50 cursor-text" onClick={() => setIsEditing(true)}>
      {notes ? (
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            <span className="font-semibold text-muted-foreground mr-2">Note:</span>
            {notes}
          </p>
          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center text-sm text-muted-foreground">
          <Edit2 className="w-4 h-4 mr-2 opacity-50" />
          <span className="opacity-70 group-hover:opacity-100 transition-opacity">Click to add personal notes for this stop...</span>
        </div>
      )}
    </div>
  );
}
