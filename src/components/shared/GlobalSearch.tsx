"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation, TrendingUp } from "lucide-react";
import { useSearchStore } from "@/store";
import { Button } from "@/components/ui/button";

export function GlobalSearch() {
  const { isSearching, setSearching, query, setQuery } = useSearchStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearching(!isSearching);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearching, setSearching]);

  if (!mounted) return null;

  return (
    <Dialog open={isSearching} onOpenChange={setSearching}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 rounded-2xl border-none shadow-2xl">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="flex items-center px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-xl">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for hidden beaches, forts, trails..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-base shadow-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 bg-background">
          {query.length === 0 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Trending Searches</h4>
                <div className="flex flex-col">
                  {["Devgad Beach", "Sindhudurg Fort", "Secret Waterfall Ratnagiri", "Vengurla Homestays"].map((item) => (
                    <Button key={item} variant="ghost" className="justify-start px-2 font-normal text-foreground/80">
                      <TrendingUp className="mr-2 h-4 w-4 text-primary/60" />
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Categories</h4>
                <div className="flex flex-wrap gap-2 px-2">
                  {["Beaches", "Forts", "Trails", "Temples"].map((category) => (
                    <span key={category} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Search Results</h4>
              <div className="flex flex-col gap-1">
                {/* Mock Search Results */}
                {[
                  { title: "Guhagar Beach", desc: "Pristine white sand beach in Ratnagiri", type: "Location" },
                  { title: "Devbagh Sangam", desc: "Where river meets the Arabian sea", type: "Location" },
                  { title: "Sindhudurg Fort", desc: "Historic sea fort built by Shivaji Maharaj", type: "Heritage" }
                ].map((result, i) => (
                  <Button key={i} variant="ghost" className="justify-start h-auto py-3 px-3">
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-0.5 p-2 bg-primary/10 rounded-lg shrink-0">
                        {result.type === "Location" ? <MapPin className="h-4 w-4 text-primary" /> : <Navigation className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium text-sm">{result.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{result.desc}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
