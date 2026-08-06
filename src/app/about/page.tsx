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
import { ArrowRight, Compass, Map, ShieldCheck, Calendar, Users, Star, Award, Search } from 'lucide-react';

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
      
      {/* Core Features Grid */}
      <section className="bg-muted/30 py-20 md:py-32 border-y border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              Platform Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to discover, verify, and plan your ultimate Konkan adventure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Discover</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse a community-curated map of hidden beaches, ancient forts, and secret waterfalls.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Verify</h3>
              <p className="text-muted-foreground leading-relaxed">
                Rely on local guides and community consensus to ensure locations are accurate and accessible.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Plan</h3>
              <p className="text-muted-foreground leading-relaxed">
                Save your favorite discoveries and organize them into beautiful, routable trip itineraries.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Share</h3>
              <p className="text-muted-foreground leading-relaxed">
                Contribute your own findings, build your reputation, and help fellow travelers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Trust Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Powered by the Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Trust is the foundation of LocalAtlas. We use decentralized mechanics to ensure data remains high-quality and spam-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <div className="bg-gradient-to-br from-background to-muted/50 p-10 md:p-12 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Award className="w-40 h-40 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-8 shadow-lg">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">Reputation System</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Contributors earn reputation points when their shared locations are verified and liked by others. A high reputation unlocks the ability to moderate content, edit listings, and officially verify newly submitted gems.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Earn points for quality contributions
                </li>
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Unlock moderation privileges
                </li>
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Build trust within the community
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-bl from-background to-muted/50 p-10 md:p-12 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="w-40 h-40 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-8 shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">Community Verification</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To prevent spam and protect delicate locations, new submissions require verification by trusted locals. Only places that pass community consensus are featured on the public map.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Protects sensitive natural sites
                </li>
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Filters out tourist traps and spam
                </li>
                <li className="flex items-center gap-3 text-foreground font-medium">
                  <ArrowRight className="w-5 h-5 text-primary" /> Ensures accurate GPS coordinates
                </li>
              </ul>
            </div>
          </div>
        </div>
        
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of local guides and travelers who are discovering the Konkan coast the right way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/25 w-full sm:w-auto" asChild>
              <Link href="/sign-up">Join LocalAtlas Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-background" asChild>
              <Link href="/explore">Explore the Map</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
