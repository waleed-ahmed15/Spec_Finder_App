'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProductFilters } from '@/hooks/use-specification';

export function ProductSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const [, setFilters] = useProductFilters();
  const [value, setValue] = useState(initialQuery);
  const lastSyncedQuery = useRef(initialQuery);
  const setFiltersRef = useRef(setFilters);

  useEffect(() => {
    setFiltersRef.current = setFilters;
  }, [setFilters]);

  // Sync input when URL changes externally (chip removal, back/forward, clear all).
  useEffect(() => {
    if (initialQuery !== lastSyncedQuery.current) {
      lastSyncedQuery.current = initialQuery;
      setValue(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = value.trim();
      if (next !== lastSyncedQuery.current.trim()) {
        lastSyncedQuery.current = next;
        setFiltersRef.current({ q: next || null, page: 1 });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products or material number"
        className="pl-9"
        aria-label="Search products or material number"
      />
    </div>
  );
}
