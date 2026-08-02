import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Map, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TripItineraryList } from '@/components/trips/TripItineraryList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip Details - LocalAtlas',
};

interface TripPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const trip = await prisma.trip.findUnique({
    where: { id, userId: session.user.id },
    include: {
      locations: {
        include: { location: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/trips">
            <ArrowLeft className="w-4 h-4" /> Back to Trips
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(trip.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{trip.locations.length} {trip.locations.length === 1 ? 'Stop' : 'Stops'}</span>
            </div>
          </div>
        </div>
        {trip.description && (
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-3xl">
            {trip.description}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
        
        {trip.locations.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
            <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium">No places added yet</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-6 max-w-md mx-auto">
              Start exploring hidden gems and add them to this trip to build your itinerary.
            </p>
            <Button asChild>
              <Link href="/explore">Explore Hidden Gems</Link>
            </Button>
          </div>
        ) : (
          <TripItineraryList tripId={trip.id} initialLocations={trip.locations} />
        )}
      </div>
    </div>
  );
}
