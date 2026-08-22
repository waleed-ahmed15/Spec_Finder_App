'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { COMPARE_PATH } from '@/lib/compare-url';
import { useSpecification } from '@/hooks/use-specification';
import { SpecificationSheet } from '@/components/specification/specification-sheet';

export function SiteHeaderClient() {
  const { items, compareSlugs, compareHydrated } = useSpecification();

  return (
    <div className="flex items-center gap-2">
      {compareHydrated && compareSlugs.length > 0 && (
        <Button variant="outline" size="sm" asChild>
          <Link href={COMPARE_PATH}>Compare ({compareSlugs.length})</Link>
        </Button>
      )}
      <SpecificationSheet count={items.length} />
    </div>
  );
}
