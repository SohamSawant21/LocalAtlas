'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LocationData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, TrendingUp, Navigation, Loader2, Heart, Star } from 'lucide-react';
import { useOptimistic, useTransition, useState } from 'react';
import { toggleSaveAction } from '@/actions/interactions';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';

interface GemCardProps {
  location: LocationData;
  isEditable?: boolean;
  onEditClick?: (e: React.MouseEvent) => void;
}

export function GemCard({ location, isEditable, onEditClick }: GemCardProps) {
  // Temporary simplified optimistic state for demo, ideally passed from parent
  const [isSaved, setIsSaved] = useState(false);
  const [optimisticSaved, addOptimisticSaved] = useOptimistic(
    isSaved,
    (state, newSaved: boolean) => newSaved
  );
  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(() => {
      addOptimisticSaved(!optimisticSaved);
    });

    const res = await toggleSaveAction(location.id);
    if (res.success) {
      setIsSaved(res.data?.saved ?? false);
    } else {
      toast.error(res.error?.message || 'Failed to save');
      // Revert in case of failure (automatic if component remounts or we can manually set it if needed)
    }
  };

  return (
    <Link href={`/location/${location.slug}`}>
      <Card className="group overflow-hidden rounded-2xl border-surface-variant bg-surface hover:shadow-lg transition-all duration-300 p-0">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={location.images[0] || '/placeholder.jpg'}
            alt={location.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-primary">
              {location.category}
            </Badge>
            {location.hiddenScore >= 9 && (
              <Badge className="bg-secondary/90 backdrop-blur-sm text-white border-none flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Hidden Gem
              </Badge>
            )}
          </div>
          <div className="absolute bottom-3 left-3">
            <button 
              onClick={handleSave}
              className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors ${optimisticSaved ? 'text-red-500' : 'text-on-surface hover:text-primary hover:bg-white'}`}
            >
              <Heart className={`w-5 h-5 ${optimisticSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          {isEditable && onEditClick && (
            <div className="absolute bottom-3 right-3">
              <button
                onClick={onEditClick}
                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors text-on-surface hover:text-primary hover:bg-white"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-headline-md text-lg font-bold text-on-surface line-clamp-1">
              {location.name}
            </h3>
            <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold">{location.hiddenScore}</span>
            </div>
          </div>
          
          <div className="flex items-center text-on-surface-variant mb-3 gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-body-md">{location.district} District</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-body-md text-on-surface-variant">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{location.crowdLevel.replace('_', ' ')} Crowd</span>
            </div>
            <div className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              <span>{location.difficulty}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
