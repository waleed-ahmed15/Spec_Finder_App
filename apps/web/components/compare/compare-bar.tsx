'use client';

import Link from 'next/link';
import { GitCompare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPARE_PATH } from '@/lib/compare-url';
import { useSpecification } from '@/hooks/use-specification';

export function CompareBar() {
  const { compareSlugs, compareHydrated, clearCompare } = useSpecification();

  if (!compareHydrated || compareSlugs.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface-raised/95 px-4 py-3 shadow-[0_-4px_24px_rgba(22,25,28,0.08)] backdrop-blur-sm"
      role="region"
      aria-label="Compare selection"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <GitCompare className="size-4 text-primary" aria-hidden />
          <span>
            <span className="font-medium text-ink">{compareSlugs.length}</span>
            <span className="text-ink-muted">
              {' '}
              {compareSlugs.length === 1 ? 'product' : 'products'} selected for compare
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearCompare} className="min-h-10">
            <X className="size-4" aria-hidden />
            Clear
          </Button>
          <Button asChild size="sm" className="min-h-10">
            <Link href={COMPARE_PATH}>View comparison</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
