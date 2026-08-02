'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TripLocationData } from '@/types';

function MapBounds({ locations }: { locations: TripLocationData[] }) {
  const map = useMap();
  useEffect(() => {
    const validLocations = locations.filter(loc => loc.location && typeof loc.location.latitude === 'number' && typeof loc.location.longitude === 'number');
    
    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations.map(loc => [loc.location!.latitude, loc.location!.longitude]));
      if (validLocations.length === 1) {
        map.setView([validLocations[0].location!.latitude, validLocations[0].location!.longitude], 12);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [locations, map]);
  return null;
}

export default function TripMapComponent({ locations }: { locations: TripLocationData[] }) {
  const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const tileAttribution = 'Tiles &copy; Esri';

  const routeCoordinates = locations
    .filter(loc => loc.location && typeof loc.location.latitude === 'number' && typeof loc.location.longitude === 'number')
    .map(loc => [loc.location!.latitude, loc.location!.longitude] as [number, number]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={routeCoordinates[0] || [16.52, 73.3]} 
        zoom={10} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        
        {routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates} 
            color="hsl(var(--primary))" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {locations.map((loc, index) => {
          if (!loc.location || typeof loc.location.latitude !== 'number' || typeof loc.location.longitude !== 'number') {
            return null;
          }
          
          const isFirst = index === 0;
          const isLast = index === locations.length - 1 && locations.length > 1;
          
          const iconHtml = `
            <div class="relative w-8 h-8 flex items-center justify-center font-bold text-white rounded-full border-2 border-white shadow-md
              ${isFirst ? 'bg-green-500' : isLast ? 'bg-red-500' : 'bg-primary'}
            ">
              ${index + 1}
            </div>
          `;
          
          return (
            <Marker 
              key={loc.id} 
              position={[loc.location.latitude, loc.location.longitude]}
              icon={L.divIcon({
                html: iconHtml,
                className: 'bg-transparent border-0',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
              })}
            >
              <Popup>
                <div className="font-bold text-sm text-foreground">{loc.location.name}</div>
                <div className="text-xs mt-1 text-muted-foreground">{loc.notes || 'No notes'}</div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapBounds locations={locations} />
      </MapContainer>
    </div>
  );
}
