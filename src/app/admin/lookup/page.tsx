import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function LookupDashboard({ searchParams }: { searchParams: { query?: string, type?: string } }) {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  let result = null;
  const q = searchParams.query;
  const t = searchParams.type;

  if (q && t) {
    if (t === 'USER') result = await prisma.user.findUnique({ where: { id: q } });
    else if (t === 'LOCATION') result = await prisma.location.findFirst({ where: { OR: [{ id: q }, { slug: q }] } });
    else if (t === 'POST') result = await prisma.communityPost.findUnique({ where: { id: q } });
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Content Lookup Tool</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search by ID</CardTitle>
          <CardDescription>Enter a User ID, Location ID or Slug, or Post ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-4">
            <select name="type" className="border rounded-md px-3 py-2" defaultValue={t || 'USER'}>
              <option value="USER">User</option>
              <option value="LOCATION">Location</option>
              <option value="POST">Community Post</option>
            </select>
            <Input name="query" placeholder="Enter ID..." defaultValue={q} className="flex-1" required />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {q && (
        <Card>
          <CardHeader>
            <CardTitle>Results for: {q}</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">No matches found for that ID and Type.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
