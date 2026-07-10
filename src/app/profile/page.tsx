import { getUserProfile } from '@/services/user';
import { ProfileView } from '@/components/profile/ProfileView';
import { User, LocationData } from '@/types';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CurrentUserProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const user = await getUserProfile(session.user.id);
  
  if (!user) return null;
  
  return <ProfileView user={user as any} locations={((user as any).locations || []) as any} />;
}
