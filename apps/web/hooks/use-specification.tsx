'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { Product } from '@specfinder/shared';

type SpecificationContextValue = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInSpecification: (productId: string) => boolean;
  compareSlugs: string[];
  toggleCompare: (slug: string) => void;
  isInCompare: (slug: string) => boolean;
};

const SpecificationContext = createContext<SpecificationContextValue | null>(null);

export function SpecificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [compare, setCompare] = useQueryStates({
    compare: parseAsArrayOf(parseAsString).withDefault([]),
  });

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [...current, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const toggleCompare = useCallback(
    (slug: string) => {
      setCompare((current) => {
        const slugs = current.compare ?? [];
        if (slugs.includes(slug)) {
          return { compare: slugs.filter((value) => value !== slug) };
        }
        if (slugs.length >= 3) return current;
        return { compare: [...slugs, slug] };
      });
    },
    [setCompare],
  );

  const value = useMemo<SpecificationContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      isInSpecification: (productId) => items.some((item) => item.id === productId),
      compareSlugs: compare.compare ?? [],
      toggleCompare,
      isInCompare: (slug) => (compare.compare ?? []).includes(slug),
    }),
    [items, addItem, removeItem, compare.compare, toggleCompare],
  );

  return <SpecificationContext.Provider value={value}>{children}</SpecificationContext.Provider>;
}

export function useSpecification() {
  const context = useContext(SpecificationContext);
  if (!context) {
    throw new Error('useSpecification must be used within SpecificationProvider');
  }
  return context;
}

export function useCompareSlugsParam() {
  return useQueryStates({
    compare: parseAsArrayOf(parseAsString).withDefault([]),
  });
}

export function useProductFilters() {
  return useQueryStates(
    {
      q: parseAsString.withDefault(''),
      application: parseAsArrayOf(parseAsString).withDefault([]),
      fireMin: parseAsInteger,
      rwMin: parseAsInteger,
      moisture: parseAsString,
      category: parseAsArrayOf(parseAsString).withDefault([]),
      sort: parseAsString.withDefault('relevance'),
      page: parseAsInteger.withDefault(1),
    },
    { history: 'push', shallow: false },
  );
}
