'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/constants';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Home, Compass, Map as MapIcon, Users, BookOpen } from 'lucide-react';

const getNavIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'home': return <Home className="w-4 h-4" />;
    case 'explore': return <Compass className="w-4 h-4" />;
    case 'map': return <MapIcon className="w-4 h-4" />;
    case 'community': return <Users className="w-4 h-4" />;
    case 'stories': return <BookOpen className="w-4 h-4" />;
    default: return null;
  }
};

export function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-black/60 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-container-max mx-auto md:px-margin-desktop px-margin-mobile">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary dark:text-primary-fixed hover:opacity-90 transition-opacity flex items-center"
        >
          LocalAtlas
        </Link>
        <div className="hidden md:flex items-center space-x-1 p-1 bg-muted/50 rounded-full border border-border/50">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out group',
                  isActive
                    ? 'text-primary bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <span className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {getNavIcon(link.label)}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="pl-10 pr-4 py-2 rounded-[16px] border border-surface-variant bg-surface-bright focus:ring-1 focus:ring-primary focus:border-primary outline-none font-body-md text-body-md w-64"
              placeholder="Search..."
              type="text"
            />
          </div>
          {/* Profile Active Indicator */}
          {status === 'loading' ? (
            <div className="w-10 h-10 rounded-full bg-surface-variant animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden">
                {session.user.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined filled text-primary">person</span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="w-full">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="rounded-full px-6">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
