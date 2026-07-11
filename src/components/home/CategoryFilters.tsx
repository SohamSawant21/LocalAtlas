import { 
  Palmtree, 
  Mountain, 
  Tent, 
  Waves, 
  Camera, 
  Utensils 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const categories = [
  { name: 'Beaches', icon: Waves, category: 'BEACH' },
  { name: 'Waterfalls', icon: Palmtree, category: 'WATERFALL' },
  { name: 'Trekking', icon: Mountain, category: 'TRAIL' },
  { name: 'Camping', icon: Tent, category: 'OTHER' },
  { name: 'Viewpoints', icon: Camera, category: 'VIEWPOINT' },
  { name: 'Local Food', icon: Utensils, category: 'EATERY' },
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
                asChild
              >
                <Link href={`/explore?category=${category.category}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{category.name}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
