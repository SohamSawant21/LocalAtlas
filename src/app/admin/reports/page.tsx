import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveReportAction } from '@/actions/moderation';

export default async function ReportsDashboard() {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  const reports = await prisma.report.findMany({
    where: { status: 'PENDING' },
    include: { reporter: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Abuse Reports Queue</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports ({reports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending reports to review. Good job!</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg flex gap-2 items-center">
                        <Badge variant="destructive">{report.type}</Badge> 
                        <span className="text-sm font-normal text-muted-foreground">Target ID: {report.targetId}</span>
                      </h3>
                      <p className="text-sm font-medium mt-2">Reason: {report.reason}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        Reported by {report.reporter?.name} on {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <form action={async () => {
                        'use server';
                        await resolveReportAction(report.id, 'DELETE_CONTENT', 'Content violated guidelines.');
                      }}>
                        <Button type="submit" variant="destructive" className="w-full">Delete Content</Button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await resolveReportAction(report.id, 'DISMISS', 'Report found to be invalid.');
                      }}>
                        <Button type="submit" variant="outline" className="w-full">Dismiss Report</Button>
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
