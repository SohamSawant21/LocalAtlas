import Link from 'next/link';
import { Map, Heart } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="relative bg-background text-muted-foreground overflow-hidden pt-20 pb-10 mt-20 md:pb-10 pb-24 border-t border-border">
      {/* Subtle Background Pattern/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20 z-0"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <Link
              href="/"
              className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 group w-fit"
            >
              <Map className="w-8 h-8 text-primary group-hover:-rotate-12 transition-transform duration-300" />
              LocalAtlas
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed text-sm md:text-base">
              Discover the Konkan only locals know. We are dedicated to uncovering hidden beaches, forgotten forts, and authentic experiences while promoting responsible tourism.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-foreground font-semibold uppercase tracking-wider text-sm">Platform</h3>
            <div className="flex flex-col gap-4">
              <Link
                href="/about"
                className="hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm md:text-base w-fit"
              >
                About
              </Link>
              <Link
                href="/guidelines"
                className="hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm md:text-base w-fit"
              >
                Guidelines
              </Link>
              <Link
                href="/contribute"
                className="hover:text-primary transition-colors duration-200 flex items-center gap-2 text-sm md:text-base w-fit"
              >
                Become a Local Guide
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-foreground font-semibold uppercase tracking-wider text-sm">Social</h3>
            <div className="flex flex-col gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors duration-200 flex items-center gap-3 group w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-pink-600 group-hover:border-pink-600 transition-all duration-300">
                  <InstagramIcon className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm md:text-base">Instagram</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors duration-200 flex items-center gap-3 group w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                  <YoutubeIcon className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm md:text-base">YouTube</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors duration-200 flex items-center gap-3 group w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-800 dark:group-hover:bg-zinc-200 dark:group-hover:border-zinc-200 transition-all duration-300">
                  <GithubIcon className="w-4 h-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black transition-colors" />
                </div>
                <span className="text-sm md:text-base">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex justify-center md:justify-start items-center text-sm">
          <p className="flex items-center gap-1.5 text-center md:text-left">
            © {new Date().getFullYear()} LocalAtlas. Crafted with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse mx-0.5" /> for the Konkan Coast.
          </p>
        </div>
      </div>
    </footer>
  );
}
