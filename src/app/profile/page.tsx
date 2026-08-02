import { getUserProfile } from '@/services/user';
import { ProfileView } from '@/components/profile/ProfileView';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getSavedLocationIds } from '@/services/interaction';

export default async function CurrentUserProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const currentUserId = session.user.id;
  const user = await getUserProfile(currentUserId);
  
  if (!user) {
    notFound();
  }
  
  const savedLocationIds = await getSavedLocationIds(currentUserId);
  
  return <ProfileView 
    user={user as any} 
    locations={((user as any).locations || []) as any} 
    currentUserId={currentUserId}
    isFollowing={false}
    savedLocationIds={Array.from(savedLocationIds)}
  />;
}
