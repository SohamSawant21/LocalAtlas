'use client';

import React, { useState } from 'react';
import { LocationData } from '@/types';
import { GemCard } from '@/components/shared/GemCard';
import { EditDiscoveryDialog } from '@/components/profile/EditDiscoveryDialog';
import { Navigation } from 'lucide-react';

interface DiscoveriesListProps {
  locations: LocationData[];
  currentUserId?: string | null;
}

export function DiscoveriesList({ locations, currentUserId }: DiscoveriesListProps) {
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);

  if (locations.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
        <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No discoveries yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          When you discover and add new places, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <GemCard 
            key={loc.id} 
            location={loc}
            isEditable={currentUserId === loc.userId}
            onEditClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingLocation(loc);
            }}
          />
        ))}
      </div>
      
      {editingLocation && (
        <EditDiscoveryDialog
          location={editingLocation}
          open={!!editingLocation}
          onOpenChange={(open) => {
            if (!open) setEditingLocation(null);
          }}
        />
      )}
    </>
  );
}
