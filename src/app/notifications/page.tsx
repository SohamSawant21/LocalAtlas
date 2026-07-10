"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, ShieldCheck, CloudLightning, Info, CheckCircle2 } from "lucide-react";
import { mockNotifications } from "./mockNotifications";
import { NotificationType } from "@/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="shrink-0 rounded-full">
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications yet"
          description="When you interact with the community or get updates on your contributions, they'll show up here."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                notification.read
                  ? "bg-card border-border/50 opacity-80"
                  : "bg-primary/5 border-primary/20 shadow-sm"
              }`}
            >
              <div className="mt-1 shrink-0 p-2 bg-background rounded-full shadow-sm border border-border/50">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-medium ${!notification.read ? "text-foreground" : "text-foreground/80"}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="shrink-0 self-center">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
