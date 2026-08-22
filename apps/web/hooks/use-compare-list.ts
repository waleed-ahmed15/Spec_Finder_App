'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { COMPARE_PATH, MAX_COMPARE_PRODUCTS } from '@/lib/compare-url';
import {
  clearCompareSlugsStorage,
  getCompareSlugsServerSnapshot,
  getCompareSlugsSnapshot,
  readCompareSlugs,
  subscribeCompareSlugs,
  writeCompareSlugs,
} from '@/lib/compare-storage';

export function useCompareList() {
  const router = useRouter();
  const compareSlugs = useSyncExternalStore(
    subscribeCompareSlugs,
    getCompareSlugsSnapshot,
    getCompareSlugsServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleCompare = useCallback(
    (slug: string) => {
      const current = readCompareSlugs();
      if (current.includes(slug)) {
        writeCompareSlugs(current.filter((value) => value !== slug));
        toast.message('Removed from compare');
        return;
      }
      if (current.length >= MAX_COMPARE_PRODUCTS) {
        toast.error(`Compare is limited to ${MAX_COMPARE_PRODUCTS} products`);
        return;
      }
      writeCompareSlugs([...current, slug]);
      toast.success('Added to compare', {
        action: {
          label: 'View',
          onClick: () => router.push(COMPARE_PATH),
        },
      });
    },
    [router],
  );

  const clearCompare = useCallback(() => {
    clearCompareSlugsStorage();
    toast.message('Compare list cleared');
  }, []);

  const isInCompare = useCallback(
    (slug: string) => compareSlugs.includes(slug),
    [compareSlugs],
  );

  return {
    compareSlugs,
    isHydrated,
    toggleCompare,
    clearCompare,
    isInCompare,
  };
}
