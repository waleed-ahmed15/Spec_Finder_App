'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { Product } from '@specfinder/shared';
import { useCompareList } from '@/hooks/use-compare-list';

type SpecificationContextValue = {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInSpecification: (productId: string) => boolean;
  compareSlugs: string[];
  compareHydrated: boolean;
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
};

const SpecificationContext = createContext<SpecificationContextValue | null>(null);

export function SpecificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const {
    compareSlugs,
    isHydrated: compareHydrated,
    toggleCompare,
    clearCompare,
    isInCompare,
  } = useCompareList();

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [...current, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const value = useMemo<SpecificationContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      isInSpecification: (productId) => items.some((item) => item.id === productId),
      compareSlugs,
      compareHydrated,
      toggleCompare,
      clearCompare,
      isInCompare,
    }),
    [items, addItem, removeItem, compareSlugs, compareHydrated, toggleCompare, clearCompare, isInCompare],
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

export function useProductDetailSlug() {
  return useQueryStates(
    {
      product: parseAsString,
    },
    { history: 'push', shallow: true },
  );
}
