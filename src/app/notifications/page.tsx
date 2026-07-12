import { auth } from '@/auth';
import { getUserNotifications } from '@/services/notification';
import { redirect } from 'next/navigation';
import { NotificationsClient } from './NotificationsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | LocalAtlas',
  description: 'View your notifications and community updates.',
};

export default async function NotificationsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  
  const notifications = await getUserNotifications(session.user.id);

  return <NotificationsClient initialNotifications={notifications as any} />;
}
