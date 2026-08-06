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

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Placeholder */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          About LocalAtlas
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
          Discover the Konkan they don't tell you about. We are a community-driven platform dedicated to uncovering authentic experiences and promoting responsible tourism.
        </p>
      </section>
      
      {/* Future sections (Mission, Features, Community) will be implemented here */}
    </div>
  );
}
