'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_LINKS } from '@/constants';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 md:hidden bg-surface/90 dark:bg-surface-dim/90 backdrop-blur-md pb-safe border-t border-surface-variant/30 pt-2">
      <div className="flex justify-between items-center px-6 py-2">
        {BOTTOM_NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;

          if (isActive) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center w-16 h-14 bg-primary-container text-on-primary-container rounded-2xl group transition-all duration-300"
              >
                <span
                  className="material-symbols-outlined mb-1 text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {link.icon}
                </span>
                <span className="font-label-md text-[10px]">{link.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center w-16 h-14 text-on-surface-variant hover:text-primary transition-colors group"
            >
              <span
                className="material-symbols-outlined mb-1 text-[24px] group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                {link.icon}
              </span>
              <span className="font-label-md text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
