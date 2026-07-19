import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { manageUserAction, suspendUserAction, changeUserRoleAction } from '@/actions/moderation';

export default async function UsersDashboard() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin'); // Redirect back to mod portal if not admin
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to 50 for now
  });

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {u.name || 'Unknown User'}
                      {u.role === 'ADMIN' && <Badge variant="default" className="bg-purple-600">Admin</Badge>}
                      {u.role === 'MODERATOR' && <Badge variant="default" className="bg-blue-600">Moderator</Badge>}
                      {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                      {u.isShadowbanned && <Badge variant="secondary">Shadowbanned</Badge>}
                      {u.suspendedUntil && new Date(u.suspendedUntil) > new Date() && (
                        <Badge variant="outline" className="text-orange-500 border-orange-500">Suspended</Badge>
                      )}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">{u.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {u.id} | Joined: {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {u.role !== 'ADMIN' && (
                    <div className="flex flex-wrap gap-2 items-center justify-end">
                      <form action={async () => {
                        'use server';
                        await changeUserRoleAction(u.id, u.role === 'MODERATOR' ? 'USER' : 'MODERATOR');
                      }}>
                        <Button type="submit" variant="outline" size="sm">
                          {u.role === 'MODERATOR' ? 'Demote to User' : 'Promote to Mod'}
                        </Button>
                      </form>

                      {!u.isBanned ? (
                        <form action={async () => { 'use server'; await manageUserAction(u.id, 'BAN'); }}>
                          <Button type="submit" variant="destructive" size="sm">Ban User</Button>
                        </form>
                      ) : (
                        <form action={async () => { 'use server'; await manageUserAction(u.id, 'UNBAN'); }}>
                          <Button type="submit" variant="outline" size="sm">Unban</Button>
                        </form>
                      )}

                      {!u.isShadowbanned ? (
                        <form action={async () => { 'use server'; await manageUserAction(u.id, 'SHADOWBAN'); }}>
                          <Button type="submit" variant="secondary" size="sm">Shadowban</Button>
                        </form>
                      ) : (
                        <form action={async () => { 'use server'; await manageUserAction(u.id, 'UNSHADOWBAN'); }}>
                          <Button type="submit" variant="outline" size="sm">Remove Shadowban</Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
