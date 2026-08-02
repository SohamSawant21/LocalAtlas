'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { verifyLocationAction } from '@/actions/verification';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationButtonProps {
  locationId: string;
  initialVerified: boolean;
  initialCount: number;
  hasVerified: boolean;
  isAuthenticated: boolean;
  userReputation?: number;
  isOwner: boolean;
}

export function VerificationButton({
  locationId,
  initialVerified,
  initialCount,
  hasVerified,
  isAuthenticated,
  userReputation = 0,
  isOwner
}: VerificationButtonProps) {
  type VerificationState = {
    verified: boolean;
    count: number;
    hasVerified: boolean;
  };

  const [verifiedState, setVerifiedState] = useState<VerificationState>({
    verified: initialVerified,
    count: initialCount,
    hasVerified
  });

  const [optimisticState, addOptimisticState] = useOptimistic<VerificationState, Partial<VerificationState>>(
    verifiedState,
    (state, newState) => ({ ...state, ...newState })
  );

  const [isPending, startTransition] = useTransition();

  const handleVerify = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to verify.");
      return;
    }
    if (userReputation < 50) {
      toast.error("You need at least 50 reputation to verify a location.");
      return;
    }
    if (isOwner) {
      toast.error("You cannot verify your own location.");
      return;
    }
    if (optimisticState.hasVerified) {
      return;
    }

    startTransition(() => {
      const newCount = optimisticState.count + 1;
      addOptimisticState({
        hasVerified: true,
        count: newCount,
        verified: optimisticState.verified || newCount >= 3
      });
    });

    const res = await verifyLocationAction(locationId);
    if (res.success && res.data) {
      setVerifiedState({
        verified: res.data.verified,
        count: res.data.verificationCount,
        hasVerified: true
      });
      toast.success("Location verified successfully!");
    } else {
      toast.error(res.error?.message || "Failed to verify location.");
      // State reverts automatically because we didn't update setVerifiedState
    }
  };

  if (isOwner) {
    return null;
  }

  const isEligible = isAuthenticated && userReputation >= 50;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleVerify}
        disabled={isPending || optimisticState.hasVerified || !isEligible}
        variant={optimisticState.hasVerified ? "outline" : "default"}
        className={`w-full text-base h-12 rounded-xl transition-all ${optimisticState.hasVerified ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-emerald-50/50' : ''}`}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5 mr-2" />
        )}
        {optimisticState.hasVerified ? "Verified by You" : "Verify this Location"}
      </Button>
      
      {!optimisticState.verified && (
        <p className="text-xs text-center text-muted-foreground font-medium">
          {optimisticState.count}/3 verifications needed
        </p>
      )}
      {!isEligible && !optimisticState.hasVerified && isAuthenticated && (
        <p className="text-xs text-center text-amber-600/80">
          Requires 50+ reputation to verify
        </p>
      )}
    </div>
  );
}
