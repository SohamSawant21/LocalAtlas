import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocationStatus } from '@prisma/client';
import { updateLocationStatusAction } from '@/actions/locations';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  const pendingLocations = await prisma.location.findMany({
    where: { status: 'PENDING' },
    include: { contributor: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Moderation Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Contributions ({pendingLocations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLocations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending contributions to review.</p>
            ) : (
              <div className="space-y-4">
                {pendingLocations.map((loc) => (
                  <div key={loc.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{loc.name} <Badge variant="outline">{loc.category}</Badge></h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{loc.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        Contributed by {loc.contributor?.name} on {new Date(loc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={async () => {
                        'use server';
                        await updateLocationStatusAction({ locationId: loc.id, status: 'APPROVED' });
                      }}>
                        <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await updateLocationStatusAction({ locationId: loc.id, status: 'REJECTED' });
                      }}>
                        <Button type="submit" variant="destructive">Reject</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
