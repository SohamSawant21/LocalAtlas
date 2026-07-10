import { TripPlanner } from '@/components/trips/TripPlanner';
import { Metadata } from 'next';
import { Map, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Trip Planner - LocalAtlas',
  description: 'Plan your next adventure with custom itineraries.',
};

export default async function TripsPage() {
  const session = await auth();
  const trips = session?.user?.id 
    ? await prisma.trip.findMany({
        where: { userId: session.user.id },
        include: {
          locations: {
            include: { location: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    : [];

  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Trip Planner</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Design your perfect getaway. Combine multiple hidden gems into a seamless itinerary.
          </p>
        </div>
        <Button size="lg" className="gap-2 shrink-0">
          <Plus className="h-5 w-5" /> New Itinerary
        </Button>
      </div>
      
      <div className="border-t pt-8">
        <TripPlanner trips={trips as any} />
      </div>
    </div>
  );
}
