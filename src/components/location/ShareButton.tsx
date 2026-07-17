"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LocationData } from "@/types";
import dynamic from "next/dynamic";

const ShareLocationModal = dynamic(
  () => import("@/components/share/ShareLocationModal").then(mod => mod.ShareLocationModal),
  { ssr: false }
);

interface ShareButtonProps {
  location: LocationData;
}

export function ShareButton({ location }: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsModalOpen(true)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {isModalOpen && (
        <ShareLocationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          location={location} 
        />
      )}
    </>
  );
}
