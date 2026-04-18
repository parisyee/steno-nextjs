"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onQueryChange: (q: string) => void;
}

export function SearchBar({ onQueryChange }: SearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => onQueryChange(value.trim()), 250);
    return () => clearTimeout(handle);
  }, [value, onQueryChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search transcriptions…"
        className="pl-9 pr-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
          onClick={() => setValue("")}
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
