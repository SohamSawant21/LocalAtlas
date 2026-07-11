'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl, Polyline, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { LocationData } from '@/types';
import { createCustomIcon } from '@/lib/maps/markers';
import { useMapStore } from '@/store';
import { MapPin, Navigation, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import L from 'leaflet';
import { MapControls } from './MapControls';
import konkanData from '@/constants/konkan.json';

// Sub-component to handle map events and sync with Zustand
function MapEvents() {
  const { setCenter, setZoom, setVisibleBounds } = useMapStore();
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useMapEvents({
    moveend: (e) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const map = e.target;
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        
        setCenter([center.lat, center.lng]);
        setZoom(zoom);
        setVisibleBounds([
          [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
          [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        ]);
      }, 250);
    },
    click: () => {
      // clicking on empty map clears selection
      useMapStore.getState().selectLocation(null);
    }
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}

// Sub-component to handle programmatically moving the map to selected marker
function MapUpdater({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  const selectedLocationId = useMapStore(state => state.selectedLocationId);

  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find(loc => loc.id === selectedLocationId);
      if (location) {
        map.flyTo([location.latitude, location.longitude], 14, { duration: 1.5 });
      }
    }
  }, [selectedLocationId, locations, map]);

  return null;
}

interface InteractiveMapProps {
  locations: LocationData[];
}

export default function InteractiveMap({ locations }: InteractiveMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  
  const { 
    center, 
    zoom, 
    selectedLocationId, 
    selectLocation,
    mapStyle,
    currentLocation,
    routeLocationIds,
    toggleRouteLocation
  } = useMapStore();
  
  const tileUrl = mapStyle === 'terrain' 
    ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  
  const tileAttribution = mapStyle === 'terrain'
    ? 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    : 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  // Extract route coordinates
  const routeCoordinates = useMemo(() => {
    return routeLocationIds
      .map(id => locations.find(loc => loc.id === id))
      .filter((loc): loc is LocationData => loc !== undefined)
      .map(loc => [loc.latitude, loc.longitude] as [number, number]);
  }, [routeLocationIds, locations]);

  // Memoize markers to avoid unnecessary re-renders
  const markers = useMemo(() => {
    return locations.map(location => {
      const isSelected = selectedLocationId === location.id;
      const inRoute = routeLocationIds.includes(location.id);
      const icon = createCustomIcon(location.category, isSelected);
      
      if (!icon) return null; // Handle SSR case if it ever reaches here
      
      return (
        <Marker 
          key={location.id} 
          position={[location.latitude, location.longitude]}
          icon={icon}
          keyboard={true}
          title={location.name}
          alt={`Marker for ${location.name}`}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              selectLocation(location.id);
            }
          }}
          zIndexOffset={isSelected ? 1000 : 0}
        >
          <Popup className="custom-popup" closeButton={false} minWidth={200}>
            <div className="p-0 -m-3 max-w-[200px] overflow-hidden rounded-xl border-none shadow-lg bg-background flex flex-col max-h-[300px]">
              <div className="relative w-full h-24 shrink-0">
                <Image 
                  src={location.images[0] || '/placeholder.jpg'} 
                  alt={`Image of ${location.name}`} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-3 bg-background text-foreground overflow-y-auto">
                <h3 className="font-bold text-sm line-clamp-1">{location.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{location.category.toLowerCase()}</p>
                <div className="mt-2 flex gap-1 items-center justify-between">
                  <span className="text-xs text-amber-500 font-semibold" aria-label={`Rating ${location.hiddenScore}`}>★ {location.hiddenScore}</span>
                  <Button 
                    size="sm" 
                    variant={inRoute ? "default" : "outline"}
                    className="h-6 text-[10px] px-2 rounded-full"
                    aria-label={inRoute ? "Remove from route" : "Add to route"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRouteLocation(location.id);
                    }}
                  >
                    <RouteIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                    {inRoute ? 'In Route' : 'Add to Route'}
                  </Button>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [locations, selectedLocationId, selectLocation, routeLocationIds, toggleRouteLocation]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        ref={setMap}
        center={center} 
        zoom={zoom} 
        maxBounds={L.latLngBounds([15.4, 72.5], [19.3, 74.5])}
        maxBoundsViscosity={1.0}
        minZoom={7}
        className="w-full h-full z-0"
        zoomControl={false} // Custom control
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />
        
        <GeoJSON 
          data={konkanData as any} 
          style={{
            color: 'hsl(var(--primary))',
            weight: 3,
            fillOpacity: 0.05,
          }} 
        />
        
        <ZoomControl position="topright" />
        <MapEvents />
        <MapUpdater locations={locations} />
        
        {/* Route Preview */}
        {routeCoordinates.length > 1 && (
          <Polyline 
            positions={routeCoordinates} 
            color="hsl(var(--primary))" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.8} 
          />
        )}
        
        {/* User Location */}
        {currentLocation && (
          <Marker 
            position={currentLocation}
            icon={L.divIcon({
              html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>`,
              className: 'bg-transparent border-0',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        
        <MarkerClusterGroup 
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
        >
          {markers}
        </MarkerClusterGroup>
      </MapContainer>
      
      <MapControls map={map} />
    </div>
  );
}
