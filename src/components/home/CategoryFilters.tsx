import { 
  Palmtree, 
  Mountain, 
  Tent, 
  Waves, 
  Camera, 
  Utensils 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { name: 'Beaches', icon: Waves },
  { name: 'Waterfalls', icon: Palmtree },
  { name: 'Trekking', icon: Mountain },
  { name: 'Camping', icon: Tent },
  { name: 'Viewpoints', icon: Camera },
  { name: 'Local Food', icon: Utensils },
];

export function CategoryFilters() {
  return (
    <section className="py-12 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button 
                key={category.name} 
                variant="outline" 
                className="rounded-full h-12 px-6 gap-2 hover:border-primary hover:text-primary transition-colors bg-card"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{category.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
