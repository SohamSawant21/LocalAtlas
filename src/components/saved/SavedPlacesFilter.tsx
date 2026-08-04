"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

const CATEGORIES = [
  "BEACH", "WATERFALL", "FORT", "TEMPLE", "TRAIL", 
  "VIEWPOINT", "EATERY", "HERITAGE", "HOMESTAY", "OTHER"
];

const DISTRICTS = ["SINDHUDURG", "RATNAGIRI", "RAIGAD"];

export function SavedPlacesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialSearch = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    let changed = false;
    
    if (debouncedSearchTerm) {
      if (params.get("q") !== debouncedSearchTerm) {
        params.set("q", debouncedSearchTerm);
        changed = true;
      }
    } else {
      if (params.has("q")) {
        params.delete("q");
        changed = true;
      }
    }
    
    if (changed) {
       router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("district");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFilters = (searchParams.has("category") ? 1 : 0) + (searchParams.has("district") ? 1 : 0);

  return (
    <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
      <div className="relative w-full md:w-[250px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search saved places..."
          className="pl-9 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: "outline", className: "flex-1 md:flex-none gap-2" })}>
            <Filter className="h-4 w-4" />
            Filter
            {activeFilters > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none">Filters</h4>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={searchParams.get("category") || "ALL"} onValueChange={(v) => handleFilterChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">District</label>
                <Select value={searchParams.get("district") || "ALL"} onValueChange={(v) => handleFilterChange("district", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Districts</SelectItem>
                    {DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={searchParams.get("sort") || "desc"} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
