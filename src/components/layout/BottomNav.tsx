'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_LINKS } from '@/constants';
import { cn } from '@/lib/utils';
import { Home, Compass, Bookmark, Map as MapIcon, User } from 'lucide-react';

const getBottomNavIcon = (label: string, isActive: boolean) => {
  const className = cn("w-6 h-6 mb-1 transition-transform duration-300", isActive && "scale-110");
  switch (label.toLowerCase()) {
    case 'home': return <Home className={className} />;
    case 'explore': return <Compass className={className} />;
    case 'saved': return <Bookmark className={className} />;
    case 'map': return <MapIcon className={className} />;
    case 'profile': return <User className={className} />;
    default: return null;
  }
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 md:hidden bg-background/90 backdrop-blur-md pb-safe border-t border-border pt-2 shadow-lg">
      <div className="flex justify-around items-center px-4 py-2">
        {BOTTOM_NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 group relative",
                isActive ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {getBottomNavIcon(link.label, isActive)}
              <span className="text-[10px] tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
