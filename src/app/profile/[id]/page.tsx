import { notFound } from 'next/navigation';
import { getUserProfile, getIsFollowing } from '@/services/user';
import { ProfileView } from '@/components/profile/ProfileView';
import { auth } from '@/auth';
import { getSavedLocationIds } from '@/services/interaction';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const user = await getUserProfile(id);
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!user) {
    notFound();
  }

  const isBanned = (user as any).isBanned;
  const isSuspended = (user as any).suspendedUntil && new Date((user as any).suspendedUntil) > new Date();
  
  if (isBanned || isSuspended) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Content Unavailable</h1>
        <p className="text-muted-foreground">This user account has been suspended or removed by a moderator for violating community guidelines.</p>
      </div>
    );
  }

  const isFollowing = currentUserId ? await getIsFollowing(currentUserId, id) : false;
  let savedLocationIds = new Set<string>();
  if (currentUserId) {
    savedLocationIds = await getSavedLocationIds(currentUserId);
  }

  return <ProfileView 
    user={user as any} 
    locations={((user as any).locations || []) as any} 
    currentUserId={currentUserId}
    isFollowing={isFollowing}
    savedLocationIds={Array.from(savedLocationIds)}
  />;
}
