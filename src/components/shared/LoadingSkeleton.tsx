import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "list" | "detail" | "grid";
  count?: number;
}

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  className,
  ...props
}: LoadingSkeletonProps) {
  const renderContent = () => {
    switch (variant) {
      case "card":
        return Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ));
      case "list":
        return Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full max-w-[250px]" />
              <Skeleton className="h-4 w-full max-w-[200px]" />
            </div>
          </div>
        ));
      case "detail":
        return (
          <div className="space-y-6 w-full">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        );
      case "grid":
        return Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[150px] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ));
    }
  };

  return (
    <div
      className={cn(
        variant === "grid" || variant === "card"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col w-full",
        className
      )}
      {...props}
    >
      {renderContent()}
    </div>
  );
}
