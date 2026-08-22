'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSpecification } from '@/hooks/use-specification';
import { SpecificationSheet } from '@/components/specification/specification-sheet';

export function SiteHeaderClient() {
  const { items, compareSlugs } = useSpecification();

  return (
    <div className="flex items-center gap-2">
      {compareSlugs.length > 0 && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/compare">Compare ({compareSlugs.length})</Link>
        </Button>
      )}
      <SpecificationSheet count={items.length} />
    </div>
  );
}
