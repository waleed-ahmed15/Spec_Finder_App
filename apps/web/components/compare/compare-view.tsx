'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  GitCompare,
  ListFilter,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@specfinder/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { FieldLabel } from '@/components/glossary/term-tooltip';
import { apiClient } from '@/lib/api-client';
import {
  facePaperColor,
  facePaperLabel,
  formatFireRating,
  formatMoisture,
  formatRw,
} from '@/lib/format';
import type { GlossaryTermId } from '@/lib/glossary';
import { MAX_COMPARE_PRODUCTS } from '@/lib/compare-url';
import { cn } from '@/lib/utils';
import { useSpecification } from '@/hooks/use-specification';

type CompareRow = {
  key: string;
  label: string;
  term?: GlossaryTermId;
  getValue: (product: Product) => string;
};

type CompareSection = {
  title: string;
  rows: CompareRow[];
};

const COMPARE_SECTIONS: CompareSection[] = [
  {
    title: 'Performance',
    rows: [
      {
        key: 'fire',
        label: 'Fire resistance',
        term: 'EI',
        getValue: (p) => formatFireRating(p.performance.fireResistanceMin),
      },
      {
        key: 'reaction',
        label: 'Reaction to fire',
        getValue: (p) => p.performance.reactionToFireClass ?? '—',
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
        getValue: (p) => formatMoisture(p.performance.moistureClass),
      },
      {
        key: 'impact',
        label: 'Impact resistance',
        getValue: (p) => p.performance.impactResistanceClass ?? '—',
      },
      {
        key: 'thermal',
        label: 'Thermal conductivity',
        term: 'lambda',
        getValue: (p) =>
          p.performance.thermalConductivity != null
            ? `${p.performance.thermalConductivity} W/mK`
            : '—',
      },
    ],
  },
  {
    title: 'Product',
    rows: [
      { key: 'family', label: 'Family', getValue: (p) => p.family },
      {
        key: 'category',
        label: 'Category',
        getValue: (p) =>
          p.category
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' '),
      },
      {
        key: 'applications',
        label: 'Applications',
        getValue: (p) =>
          p.applications
            .map((app) => app.charAt(0).toUpperCase() + app.slice(1))
            .join(', '),
      },
      {
        key: 'variants',
        label: 'Available sizes',
        getValue: (p) => `${p.variants.length} variant${p.variants.length === 1 ? '' : 's'}`,
      },
      {
        key: 'documents',
        label: 'Documents',
        getValue: (p) => `${p.documents.length} on file`,
      },
    ],
  },
  {
    title: 'Sustainability',
    rows: [
      {
        key: 'epd',
        label: 'EPD available',
        term: 'EPD',
        getValue: (p) => (p.sustainability.hasEpd ? 'Yes' : 'No'),
      },
      {
        key: 'recycled',
        label: 'Recycled content',
        getValue: (p) =>
          p.sustainability.recycledContentPct != null
            ? `${p.sustainability.recycledContentPct}%`
            : '—',
      },
    ],
  },
];

const GRID_COLUMNS = `minmax(11rem, 13rem) repeat(${MAX_COMPARE_PRODUCTS}, minmax(13.75rem, 1fr))`;

function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function rowValues(row: CompareRow, products: Product[]): string[] {
  return products.map((product) => row.getValue(product));
}

function rowDiffers(values: string[]): boolean {
  return !values.every((value) => value === values[0]);
}

function countDifferingRows(products: Product[]): number {
  return COMPARE_SECTIONS.flatMap((section) => section.rows).filter((row) =>
    rowDiffers(rowValues(row, products)),
  ).length;
}

function CompareSlotIndicator({ filled }: { filled: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${filled} of ${MAX_COMPARE_PRODUCTS} compare slots filled`}>
      {Array.from({ length: MAX_COMPARE_PRODUCTS }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'size-2.5 rounded-full transition-colors',
            index < filled ? 'bg-primary' : 'border border-rule bg-surface',
          )}
        />
      ))}
      <span className="text-sm text-ink-muted">
        {filled}/{MAX_COMPARE_PRODUCTS} slots
      </span>
    </div>
  );
}

function CompareProductColumn({
  product,
  onRemove,
  onAddToSpec,
  inSpecification,
}: {
  product: Product;
  onRemove: () => void;
  onAddToSpec: () => void;
  inSpecification: boolean;
}) {
  const accent = facePaperColor(product.facePaper);

  return (
    <article
      className="relative flex h-full flex-col rounded-md border border-rule bg-surface-raised shadow-sm"
      style={{ boxShadow: `inset 0 3px 0 0 ${accent}, 0 1px 2px rgba(22, 25, 28, 0.04)` }}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 rounded p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label={`Remove ${product.name} from compare`}
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-1 flex-col p-4 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          className="mb-3 size-16 rounded border border-rule object-cover"
        />

        <p className="eyebrow mb-1 pr-8">{product.family}</p>
        <Link
          href={`/products?product=${product.slug}`}
          className="font-display mb-1 line-clamp-2 text-lg leading-snug font-semibold hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-ink-muted">{product.tagline}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-rule bg-surface px-2 py-0.5 text-xs text-ink-muted">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            {facePaperLabel(product.facePaper)}
          </span>
          <Badge variant="outline">{formatCategoryLabel(product.category)}</Badge>
        </div>

        <div className="mt-auto grid gap-2">
          <Button
            className="min-h-10 w-full"
            onClick={onAddToSpec}
            disabled={inSpecification}
            variant={inSpecification ? 'outline' : 'default'}
          >
            {inSpecification ? (
              <>
                <Check className="size-4" aria-hidden />
                In specification
              </>
            ) : (
              'Add to specification'
            )}
          </Button>
          <Button variant="ghost" size="sm" className="min-h-9 w-full" asChild>
            <Link href={`/products?product=${product.slug}`}>View full details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyCompareSlot() {
  return (
    <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-md border border-dashed border-rule bg-surface-sunken/40 p-6 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-rule bg-surface-raised">
        <Plus className="size-5 text-ink-muted" aria-hidden />
      </div>
      <p className="mb-1 text-sm font-medium text-ink">Empty slot</p>
      <p className="mb-4 max-w-[12rem] text-xs text-ink-muted">
        Add another product to see side-by-side differences.
      </p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/products">Browse products</Link>
      </Button>
    </div>
  );
}

function CompareGridSkeleton() {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: GRID_COLUMNS }}>
      <div />
      {Array.from({ length: MAX_COMPARE_PRODUCTS }).map((_, index) => (
        <Skeleton key={index} className="min-h-[22rem] rounded-md" />
      ))}
    </div>
  );
}

function CompareEmptyState() {
  const steps = [
    'Set your project requirements on the products page.',
    'Open a product and choose Compare from the detail panel.',
    'Review differences here, then add your choice to the specification.',
  ];

  return (
    <div className="rounded-lg border border-rule bg-surface-raised p-8 md:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary-tint">
          <GitCompare className="size-7 text-primary" aria-hidden />
        </div>
        <h2 className="font-display mb-2 text-2xl font-semibold">Compare up to three products</h2>
        <p className="mx-auto mb-8 max-w-lg text-ink-muted">
          Specifiers use compare to spot performance differences before naming a product in the
          tender. Differences are highlighted so you can focus on what matters.
        </p>
        <ol className="mx-auto mb-8 max-w-md space-y-3 text-left">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-data text-xs font-semibold tabular-nums text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 text-ink-muted">{step}</span>
            </li>
          ))}
        </ol>
        <Button asChild size="lg" className="min-h-11">
          <Link href="/products">
            Browse products
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function CompareView() {
  const {
    compareSlugs,
    compareHydrated,
    toggleCompare,
    clearCompare,
    addItem,
    isInSpecification,
  } = useSpecification();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  const slugs = compareSlugs;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compare', slugs.join(',')],
    enabled: slugs.length > 0,
    queryFn: () => apiClient.compareProducts([...slugs]) as Promise<Product[]>,
  });

  const products = useMemo(() => data ?? [], [data]);
  const emptySlots = Math.max(0, MAX_COMPARE_PRODUCTS - products.length);
  const diffCount = useMemo(() => countDifferingRows(products), [products]);

  const visibleSections = useMemo(() => {
    if (!showDifferencesOnly || products.length === 0) return COMPARE_SECTIONS;

    return COMPARE_SECTIONS.map((section) => ({
      ...section,
      rows: section.rows.filter((row) => rowDiffers(rowValues(row, products))),
    })).filter((section) => section.rows.length > 0);
  }, [products, showDifferencesOnly]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-primary">Decision support</p>
          <h1 className="font-display mb-2 text-3xl font-semibold">Compare products</h1>
          <p className="max-w-2xl text-ink-muted">
            {compareHydrated && slugs.length > 0
              ? 'Review performance side by side. Identical values are muted — focus on what separates your options.'
              : 'Shortlist up to three products and identify the leanest compliant choice before you specify.'}
          </p>
        </div>

        {compareHydrated && slugs.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <CompareSlotIndicator filled={products.length || slugs.length} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="min-h-10">
                <Link href="/products">
                  <Plus className="size-4" aria-hidden />
                  Add product
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clearCompare} className="min-h-10">
                Clear all
              </Button>
            </div>
          </div>
        )}
      </header>

      {!compareHydrated && <CompareGridSkeleton />}

      {compareHydrated && slugs.length === 0 && <CompareEmptyState />}

      {compareHydrated && slugs.length > 0 && isLoading && <CompareGridSkeleton />}

      {compareHydrated && slugs.length > 0 && isError && (
        <div className="rounded-lg border border-danger/30 bg-surface-raised p-6">
          <p className="mb-1 font-medium text-danger">Could not load comparison</p>
          <p className="mb-4 text-sm text-ink-muted">
            Your selection is saved — try loading it again.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4">
          {products.length === 1 && (
            <div className="rounded-md border border-primary/20 bg-primary-tint/50 px-4 py-3 text-sm text-ink">
              <span className="font-medium">One product selected.</span>{' '}
              <span className="text-ink-muted">
                Add at least one more to highlight differences.{' '}
                <Link href="/products" className="font-medium text-primary hover:underline">
                  Browse products
                </Link>
              </span>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-rule bg-surface-raised">
            <div className="min-w-[56rem]">
              <div className="grid gap-4 p-4" style={{ gridTemplateColumns: GRID_COLUMNS }}>
                <div className="hidden md:block" aria-hidden />
                {products.map((product) => (
                  <CompareProductColumn
                    key={product.id}
                    product={product}
                    onRemove={() => toggleCompare(product.slug)}
                    onAddToSpec={() => {
                      addItem(product);
                      toast.success('Added to specification');
                    }}
                    inSpecification={isInSpecification(product.id)}
                  />
                ))}
                {Array.from({ length: emptySlots }).map((_, index) => (
                  <EmptyCompareSlot key={`empty-${index}`} />
                ))}
              </div>

              {products.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-rule bg-surface-sunken/50 px-4 py-3">
                  <p className="text-sm text-ink-muted">
                    {diffCount === 0 ? (
                      'All listed attributes match across products.'
                    ) : (
                      <>
                        <span className="font-medium text-ink">{diffCount}</span>{' '}
                        {diffCount === 1 ? 'attribute differs' : 'attributes differ'}
                      </>
                    )}
                  </p>
                  <Toggle
                    pressed={showDifferencesOnly}
                    onPressedChange={setShowDifferencesOnly}
                    variant="outline"
                    size="sm"
                    aria-label="Show differences only"
                    className="min-h-9"
                  >
                    <ListFilter className="size-4" aria-hidden />
                    Differences only
                  </Toggle>
                </div>
              )}

              <div className="divide-y divide-rule/70">
                {visibleSections.length === 0 && showDifferencesOnly && (
                  <div className="px-4 py-8 text-center text-sm text-ink-muted">
                    No differences found — all products match on listed attributes.
                  </div>
                )}

                {visibleSections.map((section) => (
                  <section key={section.title} aria-label={`${section.title} comparison`}>
                    <div
                      className="grid border-b border-rule/70 bg-surface-sunken/40"
                      style={{ gridTemplateColumns: GRID_COLUMNS }}
                    >
                      <div className="sticky left-0 z-20 bg-surface-sunken/95 px-4 py-2.5">
                        <h2 className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                          {section.title}
                        </h2>
                      </div>
                      {Array.from({ length: MAX_COMPARE_PRODUCTS }).map((_, index) => (
                        <div key={index} className="hidden md:block" aria-hidden />
                      ))}
                    </div>

                    {section.rows.map((row) => {
                      const values = rowValues(row, products);
                      const differs = rowDiffers(values);

                      return (
                        <div
                          key={row.key}
                          className={cn(
                            'grid border-b border-rule/50 last:border-0',
                            differs && 'bg-primary-tint/30',
                          )}
                          style={{ gridTemplateColumns: GRID_COLUMNS }}
                        >
                          <div
                            className={cn(
                              'sticky left-0 z-10 border-r border-rule/50 px-4 py-3 text-sm font-medium',
                              differs ? 'bg-primary-tint/30' : 'bg-surface-raised',
                            )}
                          >
                            <FieldLabel term={row.term} variant="default">
                              {row.label}
                            </FieldLabel>
                          </div>

                          {products.map((product, index) => (
                            <div
                              key={product.id}
                              className={cn(
                                'px-4 py-3 font-data text-sm tabular-nums md:border-r md:border-rule/30 md:last:border-r-0',
                                differs ? 'font-semibold text-ink' : 'text-ink-muted',
                              )}
                            >
                              {values[index]}
                            </div>
                          ))}

                          {Array.from({ length: emptySlots }).map((_, index) => (
                            <div
                              key={`empty-cell-${index}`}
                              className="hidden px-4 py-3 text-sm text-ink-muted/40 md:block"
                              aria-hidden
                            >
                              —
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </section>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Product-level comparison only — fire and acoustic ratings in a real project depend on
            the full build-up. Add your chosen product to the specification to export documentation.
          </p>
        </div>
      )}

      {compareHydrated && slugs.length > 0 && !isLoading && products.length === 0 && !isError && (
        <div className="rounded-lg border border-rule bg-surface-raised p-8 text-center">
          <p className="mb-1 font-medium">Selected products could not be found</p>
          <p className="mb-4 text-sm text-ink-muted">
            They may have been removed from the catalogue. Clear your selection and choose again.
          </p>
          <Button variant="outline" onClick={clearCompare}>
            Clear selection
          </Button>
        </div>
      )}
    </main>
  );
}
