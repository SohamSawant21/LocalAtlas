import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-6 flex flex-col gap-2">
        <h2 className="font-bold text-xl mb-4">Mod Portal</h2>
        
        <div className="text-sm font-semibold text-muted-foreground mt-4 mb-2">MODERATOR TOOLS</div>
        <Link href="/admin">
          <Button variant="ghost" className="w-full justify-start">Pending Locations</Button>
        </Link>
        <Link href="/admin/reports">
          <Button variant="ghost" className="w-full justify-start">Abuse Reports</Button>
        </Link>
        <Link href="/admin/lookup">
          <Button variant="ghost" className="w-full justify-start">Content Lookup</Button>
        </Link>

        {isAdmin && (
          <>
            <div className="text-sm font-semibold text-muted-foreground mt-6 mb-2">ADMIN TOOLS</div>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start">User Management</Button>
            </Link>
            <Link href="/admin/audit">
              <Button variant="ghost" className="w-full justify-start">Audit Logs</Button>
            </Link>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        {children}
      </div>
    </div>
  );
}
