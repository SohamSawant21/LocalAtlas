import * as React from "react";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 border-4 border-background shadow-2xl">
          <Map className="h-16 w-16 text-primary" />
        </div>
      </div>
      
      <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
        404
      </h1>
      
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Looks like you&apos;re off the map
      </h2>
      
      <p className="max-w-[400px] text-muted-foreground mb-8 text-lg">
        We couldn&apos;t find the hidden gem you&apos;re looking for. It might be too secret, or it doesn&apos;t exist yet.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
          <Link href="/">
            Back to Civilization
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/explore">
            Explore Known Places
          </Link>
        </Button>
      </div>
    </div>
  );
}
