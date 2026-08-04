import { SavedPlacesList } from '@/components/saved/SavedPlacesList';
import { Metadata } from 'next';
import { BookmarkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { District, LocationCategory } from '@prisma/client';
import { SavedPlacesFilter } from '@/components/saved/SavedPlacesFilter';

export const metadata: Metadata = {
  title: 'Saved Places - LocalAtlas',
  description: 'Your curated list of hidden gems and future adventures.',
};

export default async function SavedPlacesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : 'desc';
  const category = typeof searchParams?.category === 'string' ? searchParams.category as LocationCategory : undefined;
  const district = typeof searchParams?.district === 'string' ? searchParams.district as District : undefined;

  const locationWhere: any = {};
  if (q) locationWhere.name = { contains: q, mode: 'insensitive' };
  if (category) locationWhere.category = category;
  if (district) locationWhere.district = district;

  const savedPlaces = session?.user?.id 
    ? await prisma.savedPlace.findMany({
        where: { 
          userId: session.user.id,
          ...(Object.keys(locationWhere).length > 0 ? { location: locationWhere } : {})
        },
        include: { location: true },
        orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' }
      })
    : [];

  const locations = savedPlaces.map(sp => sp.location);

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookmarkIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Saved Places</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your curated collection of hidden gems. Plan your next adventure from here.
          </p>
        </div>
        <SavedPlacesFilter />
      </div>
      
      <div className="mt-8 border-t pt-8">
        <SavedPlacesList locations={locations as any} isAuthenticated={!!session?.user} />
      </div>
    </div>
  );
}
