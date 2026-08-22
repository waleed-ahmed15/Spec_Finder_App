'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, Plus, X } from 'lucide-react';
import type { Product } from '@specfinder/shared';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FieldLabel } from '@/components/glossary/term-tooltip';
import { apiClient } from '@/lib/api-client';
import {
  facePaperColor,
  facePaperLabel,
  formatFireRating,
  formatRw,
} from '@/lib/format';
import type { GlossaryTermId } from '@/lib/glossary';
import { MAX_COMPARE_PRODUCTS } from '@/lib/compare-url';
import { cn } from '@/lib/utils';
import { useSpecification } from '@/hooks/use-specification';

const ROWS: Array<{
  key: string;
  label: string;
  term?: GlossaryTermId;
  getValue: (product: Product) => string;
}> = [
  { key: 'family', label: 'Family', getValue: (p) => p.family },
  {
    key: 'fire',
    label: 'Fire resistance',
    term: 'EI',
    getValue: (p) => formatFireRating(p.performance.fireResistanceMin),
  },
  {
    key: 'rw',
    label: 'Sound insulation',
    term: 'Rw',
    getValue: (p) => formatRw(p.performance.soundReductionRw),
  },
  {
    key: 'moisture',
    label: 'Moisture class',
    getValue: (p) => (p.performance.moistureClass === 'none' ? 'Dry' : p.performance.moistureClass),
  },
  {
    key: 'variants',
    label: 'Variant count',
    getValue: (p) => String(p.variants.length),
  },
  {
    key: 'epd',
    label: 'EPD',
    term: 'EPD',
    getValue: (p) => (p.sustainability.hasEpd ? 'Yes' : 'No'),
  },
];

function CompareColumnHeader({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  return (
    <div
      className="relative min-w-[200px] rounded-md border border-rule bg-surface-raised p-3"
      style={{ boxShadow: `inset 0 3px 0 0 ${facePaperColor(product.facePaper)}` }}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 rounded p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label={`Remove ${product.name} from compare`}
      >
        <X className="size-4" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imageUrl}
        alt=""
        className="mb-2 size-12 rounded border border-rule object-cover"
      />
      <p className="eyebrow mb-1 pr-6">{product.family}</p>
      <Link
        href={`/products?product=${product.slug}`}
        className="font-display line-clamp-2 text-base leading-snug font-semibold hover:text-primary"
      >
        {product.name}
      </Link>
      <p className="mt-1 text-xs text-ink-muted">{facePaperLabel(product.facePaper)}</p>
    </div>
  );
}

function EmptyCompareSlot() {
  return (
    <div className="flex min-h-[140px] min-w-[200px] flex-col items-center justify-center rounded-md border border-dashed border-rule bg-surface-sunken/50 p-4 text-center">
      <Plus className="mb-2 size-5 text-ink-muted" aria-hidden />
      <p className="mb-2 text-sm text-ink-muted">Add a product</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/products">Browse products</Link>
      </Button>
    </div>
  );
}

export function CompareView() {
  const { compareSlugs, compareHydrated, toggleCompare, clearCompare } = useSpecification();
  const slugs = compareSlugs;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compare', slugs.join(',')],
    enabled: slugs.length > 0,
    queryFn: () => apiClient.compareProducts(slugs) as Promise<Product[]>,
  });

  const emptySlots = Math.max(0, MAX_COMPARE_PRODUCTS - (data?.length ?? slugs.length));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display mb-1 text-3xl font-semibold">Compare products</h1>
          <p className="text-ink-muted">
            {compareHydrated && slugs.length > 0
              ? `Comparing ${slugs.length} of ${MAX_COMPARE_PRODUCTS} products — differences are highlighted.`
              : 'Select up to three products to compare side by side.'}
          </p>
        </div>
        {compareHydrated && slugs.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">
                <Plus className="size-4" aria-hidden />
                Add product
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {!compareHydrated && (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40 rounded-md" />
          <Skeleton className="h-40 rounded-md" />
        </div>
      )}

      {compareHydrated && slugs.length === 0 && (
        <div className="rounded-lg border border-rule bg-surface-raised p-10 text-center">
          <GitCompare className="mx-auto mb-4 size-10 text-ink-muted/50" aria-hidden />
          <h2 className="font-display mb-2 text-xl font-semibold">No products to compare</h2>
          <p className="mx-auto mb-6 max-w-md text-ink-muted">
            Open a product and choose Compare, or use the compare action on any product detail
            panel. You can compare up to three products at once.
          </p>
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      )}

      {compareHydrated && slugs.length > 0 && isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {slugs.map((slug) => (
            <Skeleton key={slug} className="h-40 rounded-md" />
          ))}
        </div>
      )}

      {compareHydrated && slugs.length > 0 && isError && (
        <div className="rounded-lg border border-danger/30 bg-surface-raised p-6">
          <p className="mb-3 text-danger">Could not load comparison.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-min gap-4">
              {data.map((product) => (
                <CompareColumnHeader
                  key={product.id}
                  product={product}
                  onRemove={() => toggleCompare(product.slug)}
                />
              ))}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <EmptyCompareSlot key={`empty-${index}`} />
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-rule">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule bg-surface-sunken/60">
                  <th className="sticky left-0 z-10 min-w-[160px] bg-surface-sunken/95 px-4 py-3 text-left font-medium">
                    Attribute
                  </th>
                  {data.map((product) => (
                    <th
                      key={product.id}
                      className="min-w-[140px] px-4 py-3 text-left font-display font-semibold"
                    >
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const values = data.map((product) => row.getValue(product));
                  const allSame = values.every((value) => value === values[0]);
                  return (
                    <tr
                      key={row.key}
                      className={cn(
                        'border-b border-rule/70 last:border-0',
                        !allSame && 'bg-primary-tint/40',
                      )}
                    >
                      <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-medium">
                        <FieldLabel term={row.term} variant="default">
                          {row.label}
                        </FieldLabel>
                      </td>
                      {data.map((product, index) => (
                        <td
                          key={product.id}
                          className={cn(
                            'px-4 py-3 font-data tabular-nums',
                            allSame ? 'text-ink-muted' : 'font-semibold text-ink',
                          )}
                        >
                          {values[index]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.length === 1 && (
            <p className="text-sm text-ink-muted">
              Add at least one more product to see differences highlighted.{' '}
              <Link href="/products" className="font-medium text-primary hover:underline">
                Browse products
              </Link>
            </p>
          )}
        </div>
      )}

      {compareHydrated && slugs.length > 0 && !isLoading && data?.length === 0 && !isError && (
        <div className="rounded-lg border border-rule bg-surface-raised p-6 text-center">
          <p className="mb-4 text-ink-muted">Selected products could not be found.</p>
          <Button variant="outline" onClick={clearCompare}>
            Clear selection
          </Button>
        </div>
      )}
    </main>
  );
}
