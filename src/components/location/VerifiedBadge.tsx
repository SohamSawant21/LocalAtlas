import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  withTooltip?: boolean;
}

export function VerifiedBadge({ className, withTooltip = true }: VerifiedBadgeProps) {
  const badge = (
    <div className={cn("inline-flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 px-2.5 py-0.5 text-xs font-semibold gap-1 shrink-0 border border-emerald-500/20 shadow-sm", className)}>
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Verified</span>
    </div>
  );

  if (!withTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-default focus:outline-none">
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>Community Verified: 3+ trusted users have confirmed this location.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
