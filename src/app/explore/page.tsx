import { getLocations } from '@/services/location';
import { ExploreClient } from './ExploreClient';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { getSavedLocationIds } from '@/services/interaction';

export default async function ExplorePage() {
  const locations = await getLocations();
  const session = await auth();
  
  let savedLocationIds = new Set<string>();
  if (session?.user?.id) {
    savedLocationIds = await getSavedLocationIds(session.user.id);
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background pb-12" />}>
      <ExploreClient locations={locations} savedLocationIds={Array.from(savedLocationIds)} />
    </Suspense>
  );
}
