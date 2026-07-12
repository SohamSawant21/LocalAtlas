import { SavedPlacesList } from '@/components/saved/SavedPlacesList';
import { Metadata } from 'next';
import { BookmarkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Saved Places - LocalAtlas',
  description: 'Your curated list of hidden gems and future adventures.',
};

export default async function SavedPlacesPage() {
  const session = await auth();
  const savedPlaces = session?.user?.id 
    ? await prisma.savedPlace.findMany({
        where: { userId: session.user.id },
        include: { location: true },
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
        <div className="w-full md:w-auto flex gap-2" title="Filtering coming soon">
          <Input placeholder="Search saved places..." className="w-full md:w-[250px]" disabled />
          <Button variant="outline" disabled>Filter</Button>
        </div>
      </div>
      
      <div className="mt-8 border-t pt-8">
        <SavedPlacesList locations={locations as any} isAuthenticated={!!session?.user} />
      </div>
    </div>
  );
}
