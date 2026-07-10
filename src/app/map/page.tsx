import { getLocations } from '@/services/location';
import { MapClient } from './MapClient';

export default async function MapPage() {
  const locations = await getLocations();
  return <MapClient initialLocations={locations} />;
}
