import { getLocations } from '@/services/location';
import { ExploreClient } from './ExploreClient';

export default async function ExplorePage() {
  const locations = await getLocations();
  return <ExploreClient locations={locations} />;
}
