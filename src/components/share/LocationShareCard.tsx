import React from 'react';
import { MapPin, Mountain, Star, Calendar } from 'lucide-react';
import { LocationData } from '@/types';
import { QRCodeSVG } from 'qrcode.react';

interface LocationShareCardProps {
  location: LocationData;
  url: string;
}

export const LocationShareCard = React.forwardRef<HTMLDivElement, LocationShareCardProps>(
  ({ location, url }, ref) => {
    // We render at exactly 540x960 px.
    // Exporting with pixelRatio=2 produces a 1080x1920 high-res PNG (9:16 aspect ratio).
    return (
      <div 
        ref={ref} 
        className="w-[540px] h-[960px] bg-white text-zinc-900 relative overflow-hidden flex flex-col font-sans border-0 shadow-none m-0 p-0"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Cover Image */}
        <div className="relative w-full h-[60%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={location.images[0] || '/placeholder.jpg'} 
            alt={location.name}
            className="object-cover w-full h-full"
            // Removed crossOrigin="anonymous" to fix the preview loading issue.
            // html-to-image with useCORS: true will handle cors when exporting.
          />
        </div>

        {/* Content */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-10 h-[65%] flex flex-col justify-end"
          style={{ 
            background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.9) 65%, transparent 100%)' 
          }}
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
              {location.category}
            </span>
            <div className="flex items-center text-yellow-600 font-bold bg-yellow-500/10 px-3 py-1 rounded-full text-[10px]">
              <Star className="w-3.5 h-3.5 mr-1 fill-current" />
              {location.hiddenScore}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 leading-tight text-zinc-900">{location.name}</h1>
          
          <div className="flex items-center text-zinc-600 mb-6 text-base">
            <MapPin className="w-4 h-4 mr-1.5" />
            <span>{location.district}, Konkan</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <Mountain className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Difficulty</p>
                <p className="font-medium text-xs mt-0.5 text-zinc-900">{location.difficulty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Best Season</p>
                <p className="font-medium text-xs mt-0.5 text-zinc-900">{location.bestSeason}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-600 line-clamp-3 mb-8 leading-relaxed">
            {location.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 pt-5 mt-auto">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
                LA
              </div>
              <div>
                <p className="font-bold text-base text-zinc-900">LocalAtlas</p>
                <p className="text-xs text-zinc-500">Discover Hidden Konkan</p>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
              <QRCodeSVG value={url} size={56} level="L" includeMargin={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
LocationShareCard.displayName = 'LocationShareCard';
