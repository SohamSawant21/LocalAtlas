import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about LocalAtlas, our mission to uncover hidden gems on the Konkan coast, and our community-driven approach to responsible tourism.',
  keywords: [
    'About LocalAtlas', 
    'Konkan tourism', 
    'community travel', 
    'responsible tourism', 
    'hidden gems Konkan',
    'travel guide'
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About LocalAtlas | Discover Hidden Konkan Gems',
    description: 'Learn about LocalAtlas, our mission to uncover hidden gems on the Konkan coast, and our community-driven approach to responsible tourism.',
    url: '/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About LocalAtlas | Discover Hidden Konkan Gems',
    description: 'Learn about LocalAtlas, our mission to uncover hidden gems on the Konkan coast, and our community-driven approach to responsible tourism.',
  },
};

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden flex items-center justify-center py-24 md:py-32 lg:py-40 border-b border-border">
        <div className="absolute inset-0 z-0">
          <Image
            src="/konkan_hero_bg.jpg"
            alt="Scenic view of the Konkan coast"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
        </div>
        
        <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold tracking-wide uppercase">
            <Compass className="w-4 h-4" />
            <span>Community-Driven Travel</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-tight">
            Discover the Konkan <br className="hidden md:block" />
            <span className="text-primary">They Don't Tell You About</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            LocalAtlas is a crowdsourced platform dedicated to uncovering authentic experiences, hidden beaches, and forgotten forts along the Konkan coast while promoting responsible tourism.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="gap-2 h-12 px-8 text-base" asChild>
              <Link href="/explore">
                Start Exploring <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-md" asChild>
              <Link href="/contribute">Become a Contributor</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Mission Statement Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden aspect-square md:aspect-[4/3] lg:aspect-square shadow-2xl border border-border/50 group">
            <Image
              src="/images/konkan_hidden_gem.jpg"
              alt="Discovering hidden gems in Konkan"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent pointer-events-none" />
          </div>
          
          <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Our Mission
            </h2>
            <div className="w-20 h-1.5 bg-primary rounded-full"></div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Traditional travel websites funnel everyone to the same overcrowded tourist traps. We believe the true beauty of the Konkan coast lies off the beaten path—in the quiet villages, untouched coves, and centuries-old ruins known only to locals.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to build a decentralized, community-driven atlas that preserves and shares this authentic knowledge. We aim to empower local guides, support sustainable tourism, and help respectful travelers discover the hidden soul of Maharashtra's coastline.
            </p>
            <div className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1.5 rounded-full text-primary shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-foreground font-medium text-lg">Uncover Authentic Experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1.5 rounded-full text-primary shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-foreground font-medium text-lg">Promote Sustainable Tourism</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-1.5 rounded-full text-primary shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-foreground font-medium text-lg">Empower Local Communities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Future sections (Features, Community) will be implemented here */}
    </div>
  );
}
