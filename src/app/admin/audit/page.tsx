import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AuditLogDashboard() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  const logs = await prisma.moderatorActionLog.findMany({
    include: { moderator: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Moderator Audit Logs</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No actions recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-base flex gap-2 items-center">
                        <span className="text-primary">{log.moderator?.name || 'Unknown Mod'}</span> 
                        <Badge variant="outline">{log.action}</Badge>
                      </h3>
                      {log.targetType && log.targetId && (
                        <div className="text-sm mt-1">
                          Target: <Badge variant="secondary">{log.targetType}</Badge> ID: <span className="font-mono text-xs">{log.targetId}</span>
                        </div>
                      )}
                      {log.details && (
                        <p className="text-sm mt-2 text-muted-foreground bg-muted p-2 rounded">
                          {log.details}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
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
