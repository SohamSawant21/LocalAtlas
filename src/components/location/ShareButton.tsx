"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LocationData } from "@/types";
import { ShareLocationModal } from "@/components/share/ShareLocationModal";

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

      <ShareLocationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        location={location} 
      />
    </>
  );
}
