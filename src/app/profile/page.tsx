import { getUserProfile } from '@/services/user';
import { ProfileView } from '@/components/profile/ProfileView';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function CurrentUserProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const currentUserId = session.user.id;
  const user = await getUserProfile(currentUserId);
  
  if (!user) return null;
  
  return <ProfileView 
    user={user as any} 
    locations={((user as any).locations || []) as any} 
    currentUserId={currentUserId}
    isFollowing={false}
  />;
}
