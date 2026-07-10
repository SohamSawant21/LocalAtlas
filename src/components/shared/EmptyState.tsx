import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center animate-in fade-in-50 bg-card",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
