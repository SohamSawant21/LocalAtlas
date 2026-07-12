import { Hero } from '@/components/home/Hero';
import { CategoryFilters } from '@/components/home/CategoryFilters';
import { GemCard } from '@/components/home/GemCard';
import { GuideCard } from '@/components/home/GuideCard';
import { getLocations } from '@/services/location';
import { getTopGuides } from '@/services/user';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const locations = await getLocations({ limit: 4 });
  const topGuides = await getTopGuides(4);

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <CategoryFilters />
      
      {/* Trending Gems Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Compass className="w-5 h-5" />
                <span>TRENDING NOW</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Hidden Gems of the Month
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">
                The most stunning newly discovered locations by our community.
              </p>
            </div>
            <Button variant="outline" className="rounded-full gap-2 hidden md:flex" asChild>
              <Link href="/explore">
                Explore All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locations.map((location) => (
              <GemCard key={location.id} location={location} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="rounded-full gap-2 w-full" asChild>
              <Link href="/explore">
                Explore All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Top Local Guides Section */}
      <section className="py-20 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Top Local Guides
            </h2>
            <p className="text-muted-foreground text-lg">
              Follow the experts who know the Konkan region like the back of their hand.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {topGuides.map((guide) => (
              <GuideCard key={guide.id} user={guide as any} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 md:py-24 px-4">
        <div className="container mx-auto relative rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url(/images/konkan_hidden_gem.jpg)' }}
          >
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="relative z-10 text-center max-w-4xl mx-auto py-20 px-6 md:px-12 md:py-32 flex flex-col items-center justify-center min-h-[400px]">
            <span className="inline-block px-5 py-2 rounded-full bg-white/20 text-white backdrop-blur-md text-xs md:text-sm font-bold tracking-widest uppercase mb-6 shadow-sm border border-white/30">
              Join the Movement
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-xl leading-tight tracking-tight">
              Know a Secret Spot?
            </h2>
            <p className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium leading-relaxed">
              Join the LocalAtlas community, share your hidden gems, and build your reputation as a top local guide in the Konkan region.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full text-base h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1" asChild>
                <Link href="/sign-up">Become a Guide</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-base h-14 px-10 bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-sm font-bold shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                <Link href="/contribute">Submit a Location</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
