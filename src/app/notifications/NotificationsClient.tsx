"use client";

import { useOptimistic, useTransition, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, ShieldCheck, CloudLightning, Info, CheckCircle2 } from "lucide-react";
import { NotificationType } from "@/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/actions/notifications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "LIKE":
      return <Heart className="h-5 w-5 text-rose-500" />;
    case "APPROVAL":
    case "VERIFICATION":
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case "WEATHER_ALERT":
    case "ROAD_CLOSURE":
      return <CloudLightning className="h-5 w-5 text-amber-500" />;
    case "SYSTEM":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "ACHIEVEMENT":
      return <ShieldCheck className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getNotificationLink = (notification: any) => {
  if (notification.location?.slug) return `/location/${notification.location.slug}`;
  if (notification.actor?.id) return `/profile/${notification.actor.id}`;
  return null;
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [optimisticNotifications, addOptimisticNotifications] = useOptimistic(
    initialNotifications,
    (state, action: { type: 'markRead', id: string } | { type: 'markAllRead' }) => {
      if (action.type === 'markAllRead') {
        return state.map(n => ({ ...n, read: true }));
      }
      return state.map(n => n.id === action.id ? { ...n, read: true } : n);
    }
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const markAllAsRead = async () => {
    startTransition(() => {
      addOptimisticNotifications({ type: 'markAllRead' });
    });
    
    const res = await markAllNotificationsAsReadAction();
    if (!res.success) {
      toast.error(res.error?.message || 'Failed to mark notifications as read');
    }
  };

  const markAsRead = async (notification: any) => {
    if (!notification.read) {
      startTransition(() => {
        addOptimisticNotifications({ type: 'markRead', id: notification.id });
      });
      
      const res = await markNotificationAsReadAction(notification.id);
      if (!res.success) {
        toast.error(res.error?.message || 'Failed to mark notification as read');
      }
    }
    
    // Navigation
    const link = getNotificationLink(notification);
    if (link) {
      router.push(link);
    }
  };

  const unreadCount = optimisticNotifications.filter(n => !n.read).length;

  return (
    <div className="container max-w-3xl py-8 md:py-12 px-4 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="shrink-0 rounded-full" disabled={isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      {optimisticNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications yet"
          description="When you interact with the community or get updates on your contributions, they'll show up here."
        />
      ) : (
        <div className="space-y-4">
          {optimisticNotifications.map((notification) => {
            const link = getNotificationLink(notification);
            const content = (
              <div className="mt-1 shrink-0 p-2 bg-background rounded-full shadow-sm border border-border/50">
                {getNotificationIcon(notification.type)}
              </div>
            );
            
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    markAsRead(notification);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${notification.title}, ${notification.read ? 'read' : 'unread'}`}
                className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  notification.read
                    ? "bg-card border-border/50 opacity-80"
                    : "bg-primary/5 border-primary/20 shadow-sm"
                }`}
              >
                {content}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${!notification.read ? "text-foreground" : "text-foreground/80"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="shrink-0 self-center">
                    <div className="h-2 w-2 bg-primary rounded-full" aria-label="Unread indicator" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
