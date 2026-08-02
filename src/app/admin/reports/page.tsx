import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPendingReportsWithContext } from '@/services/moderation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReportActionButtons } from '@/components/admin/ReportActionButtons';

export default async function ReportsDashboard() {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/');
  }

  const reports = await getPendingReportsWithContext();

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
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg flex gap-2 items-center">
                          <Badge variant="destructive">{report.type}</Badge> 
                          <span className="text-sm font-normal text-muted-foreground">Target ID: {report.targetId}</span>
                        </h3>
                        {report.context.url && (
                          <Link href={report.context.url} target="_blank" className="text-sm text-primary hover:underline">
                            View Original Content ↗
                          </Link>
                        )}
                      </div>
                      
                      <div className="mt-3 bg-muted/30 p-3 rounded-md border text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">Reported Content Preview:</p>
                        <p className="whitespace-pre-wrap">{report.context.snippet}</p>
                        <p className="text-xs text-muted-foreground mt-2">— Posted by: {report.context.authorName}</p>
                      </div>

                      <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-md border border-red-100 dark:border-red-900/30">
                        <p className="text-sm font-medium text-red-800 dark:text-red-400">Reason: {report.reason}</p>
                      </div>

                      <div className="text-xs text-muted-foreground mt-3 flex justify-between">
                        <span>Reported by <strong>{report.reporter?.name || 'Unknown'}</strong> ({report.reporter?.email})</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <ReportActionButtons reportId={report.id} />
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
