import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900">
        <img 
          src="/konkan_hero_bg.jpg" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Discover Konkan&apos;s <span className="text-primary">Hidden</span> Secrets
        </h1>
        <p className="text-lg md:text-xl text-zinc-200 mb-10 max-w-2xl mx-auto">
          Explore untouched beaches, secret waterfalls, and authentic homestays verified by local experts.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-background/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl max-w-2xl mx-auto border border-border">
          <div className="flex-1 flex items-center gap-3 px-4 w-full border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Where do you want to go?" 
              className="w-full border-0 focus:outline-none focus:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground px-0 h-12 text-lg"
            />
          </div>
          <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold text-base gap-2">
            <Search className="w-5 h-5" />
            Search
          </Button>
        </div>
      </div>
    </section>
  );
}
