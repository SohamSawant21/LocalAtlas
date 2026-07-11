import { getLocations } from '@/services/location';
import { ExploreClient } from './ExploreClient';
import { Suspense } from 'react';

export default async function ExplorePage() {
  const locations = await getLocations();
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pb-12" />}>
      <ExploreClient locations={locations} />
    </Suspense>
  );
}
