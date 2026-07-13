import { LocationData } from '@/types';
import { MapPin, Star, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface GemCardProps {
  location: LocationData;
}

export function GemCard({ location }: GemCardProps) {
  return (
    <Link href={`/location/${location.slug}`}>
      <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full cursor-pointer rounded-2xl p-0">
        <div className="relative h-56 overflow-hidden">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={location.images[0] || 'https://via.placeholder.com/400x300'} 
            alt={location.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 font-medium">
              <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
              {location.hiddenScore}
            </Badge>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground hover:bg-primary font-medium">
              {location.category.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{location.district}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {location.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
            {location.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border">
                <Users className="w-3 h-3 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {location.difficulty}
              </span>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {location.crowdLevel} CROWD
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
