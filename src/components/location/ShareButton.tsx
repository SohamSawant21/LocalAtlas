"use client";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const shareData = {
      title,
      text: text || `Check out ${title} on LocalAtlas`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          fallbackCopy(shareUrl);
        }
      }
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const fallbackCopy = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" className="w-full rounded-xl" onClick={handleShare}>
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
