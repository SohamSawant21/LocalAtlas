import { notFound } from 'next/navigation';
import { getUserProfile } from '@/services/user';
import { ProfileView } from '@/components/profile/ProfileView';
import { User, LocationData } from '@/types';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const user = await getUserProfile(id);

  if (!user) {
    notFound();
  }

  return <ProfileView user={user as any} locations={((user as any).locations || []) as any} />;
}
