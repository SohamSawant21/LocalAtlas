import type { Metadata } from 'next';
import { Montserrat, Inter, Geist } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { NavBar, Footer, BottomNav } from '@/components/layout';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'LocalAtlas - Discover the Konkan Only Locals Know',
    template: '%s | LocalAtlas',
  },
  description:
    'Explore hidden beaches, forgotten forts, secret waterfalls, and authentic local experiences along the Konkan coast. Community-driven travel discovery platform.',
  keywords: [
    'Konkan',
    'travel',
    'hidden gems',
    'beaches',
    'waterfalls',
    'forts',
    'Maharashtra',
    'Sindhudurg',
    'Ratnagiri',
    'Raigad',
    'local guide',
    'community travel',
  ],
  authors: [{ name: 'LocalAtlas' }],
  creator: 'LocalAtlas',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'LocalAtlas - Discover the Konkan Only Locals Know',
    description:
      'Explore hidden beaches, forgotten forts, secret waterfalls, and authentic local experiences.',
    siteName: 'LocalAtlas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalAtlas - Discover the Konkan Only Locals Know',
    description:
      'Explore hidden beaches, forgotten forts, secret waterfalls, and authentic local experiences.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(montserrat.variable, inter.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#002a48" />
      </head>
      <body className="min-h-screen antialiased flex flex-col pt-[88px] pb-[88px] md:pb-0">
        <Providers>
          <NavBar />
          <main className="flex-grow flex flex-col w-full relative z-10">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
