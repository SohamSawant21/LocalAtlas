import L from 'leaflet';
import { LocationCategory } from '@/types';
import { renderToString } from 'react-dom/server';
import { 
  Palmtree, 
  Droplets, 
  Castle, 
  Landmark, 
  Map, 
  Camera, 
  Utensils, 
  Building, 
  Home, 
  MapPin 
} from 'lucide-react';
import React from 'react';

const getCategoryIcon = (category: LocationCategory) => {
  switch (category) {
    case 'BEACH': return <Palmtree size={18} />;
    case 'WATERFALL': return <Droplets size={18} />;
    case 'FORT': return <Castle size={18} />;
    case 'TEMPLE': return <Landmark size={18} />;
    case 'TRAIL': return <Map size={18} />;
    case 'VIEWPOINT': return <Camera size={18} />;
    case 'EATERY': return <Utensils size={18} />;
    case 'HERITAGE': return <Building size={18} />;
    case 'HOMESTAY': return <Home size={18} />;
    default: return <MapPin size={18} />;
  }
};

const getCategoryColor = (category: LocationCategory, isSelected: boolean) => {
  if (isSelected) return 'bg-primary text-primary-foreground scale-125 z-50 border-4 border-white';
  
  switch (category) {
    case 'BEACH': return 'bg-cyan-500 text-white';
    case 'WATERFALL': return 'bg-blue-500 text-white';
    case 'FORT': return 'bg-amber-700 text-white';
    case 'TEMPLE': return 'bg-orange-500 text-white';
    case 'TRAIL': return 'bg-green-600 text-white';
    case 'VIEWPOINT': return 'bg-indigo-500 text-white';
    case 'EATERY': return 'bg-red-500 text-white';
    case 'HERITAGE': return 'bg-amber-900 text-white';
    case 'HOMESTAY': return 'bg-teal-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const createCustomIcon = (category: LocationCategory, isSelected: boolean = false) => {
  if (typeof window === 'undefined') return null as any;

  const colorClass = getCategoryColor(category, isSelected);
  const iconContent = getCategoryIcon(category);
  
  const html = renderToString(
    <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform duration-200 ${colorClass}`}>
      {iconContent}
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-leaflet-icon bg-transparent border-0',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};
