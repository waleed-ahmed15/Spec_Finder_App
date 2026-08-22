'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProductsResponse } from '@specfinder/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveFilterChips } from '@/components/filters/active-filter-chips';
import { ProductFiltersPanel } from '@/components/filters/product-filters-panel';
import { ProductSearch } from '@/components/filters/product-search';
import { ProductCard } from '@/components/products/product-card';
import { TermTooltip } from '@/components/glossary/term-tooltip';
import { apiClient } from '@/lib/api-client';
import { queryToSearchParams, SORT_LABELS } from '@/lib/query-params';
import { useProductFilters } from '@/hooks/use-specification';
import type { SortOption } from '@specfinder/shared';

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded border border-rule bg-surface-raised">
      <div className="flex gap-3 px-4 pt-4 pb-3">
        <Skeleton className="size-14 shrink-0 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-none" />
      <Skeleton className="mx-4 mt-2 h-3 w-2/3" />
      <div className="mt-3 flex gap-2 border-t border-rule px-4 py-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

function EmptyState({
  appliedFilters,
  onRelaxRw,
}: {
  appliedFilters: Record<string, unknown>;
  onRelaxRw?: () => void;
}) {
  const fireMin = appliedFilters.fireMin as number | undefined;
  const rwMin = appliedFilters.rwMin as number | undefined;

  if (fireMin && rwMin) {
    const suggestion = Math.max(30, rwMin - 6);
    return (
      <div className="rounded border border-rule bg-surface-raised p-8 text-center">
        <h2 className="font-display mb-2 text-xl font-semibold">
          No products meet your requirements
        </h2>
        <p className="mb-4 text-ink-muted">
          No products meet{' '}
          <TermTooltip term="Rw">
            <span>Rw ≥ {rwMin} dB</span>
          </TermTooltip>{' '}
          with{' '}
          <TermTooltip term="EI">
            <span>EI {fireMin}</span>
          </TermTooltip>
          . Try lowering the acoustic requirement to {suggestion} dB.
        </p>
        {onRelaxRw && (
          <Button onClick={onRelaxRw}>
            Set <TermTooltip term="Rw">Rw</TermTooltip> to ≥ {suggestion} dB
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded border border-rule bg-surface-raised p-8 text-center">
      <h2 className="font-display mb-2 text-xl font-semibold">No products match</h2>
      <p className="text-ink-muted">Adjust or clear your filters to see more results.</p>
    </div>
  );
}

export function ProductsResults() {
  const [filters, setFilters] = useProductFilters();

  const searchParams = queryToSearchParams({
    q: filters.q || undefined,
    application: filters.application?.length
      ? (filters.application as ProductsResponse['items'][0]['product']['applications'])
      : undefined,
    fireMin: filters.fireMin ?? undefined,
    rwMin: filters.rwMin ?? undefined,
    moisture:
      filters.moisture && filters.moisture !== 'none'
        ? (filters.moisture as 'H2' | 'H3')
        : undefined,
    category: filters.category?.length
      ? (filters.category as ProductsResponse['items'][0]['product']['category'][])
      : undefined,
    sort: (filters.sort as SortOption) ?? 'relevance',
    page: filters.page ?? 1,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: () => apiClient.getProducts(searchParams) as Promise<ProductsResponse>,
  });

  const hasRequirements = Boolean(
    filters.fireMin ||
    (filters.rwMin && filters.rwMin > 30) ||
    (filters.moisture && filters.moisture !== 'none') ||
    (filters.application?.length ?? 0) > 0 ||
    (filters.category?.length ?? 0) > 0,
  );

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.application?.length ?? 0) +
    (filters.fireMin ? 1 : 0) +
    (filters.rwMin && filters.rwMin > 30 ? 1 : 0) +
    (filters.moisture && filters.moisture !== 'none' ? 1 : 0) +
    (filters.category?.length ?? 0);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_1fr] md:px-6">
      <aside className="hidden md:block">
        <div className="sticky top-6 space-y-4 rounded border border-rule bg-surface-raised p-4">
          <h2 className="font-display text-base font-semibold">Requirements</h2>
          <ProductFiltersPanel />
        </div>
      </aside>

      <section className="space-y-4">
        <ProductSearch initialQuery={filters.q ?? ''} />

        <div className="flex items-center justify-between gap-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="min-h-11">
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Requirements</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <ProductFiltersPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <ActiveFilterChips />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-ink-muted">
            {isLoading
              ? 'Loading products…'
              : data
                ? `${data.total} products meet your requirements`
                : ' '}
          </p>
          <Select
            value={filters.sort ?? 'relevance'}
            onValueChange={(value) => setFilters({ sort: value, page: 1 })}
          >
            <SelectTrigger className="w-[220px]" aria-label="Sort results">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!hasRequirements && !isLoading && data && data.total > 0 && (
          <p className="text-sm text-ink-muted">
            Set your project requirements to narrow these results.
          </p>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Results could not be loaded</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{error instanceof Error ? error.message : 'Unknown error'}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && data && data.total === 0 && (
          <EmptyState
            appliedFilters={data.appliedFilters}
            onRelaxRw={
              data.appliedFilters.rwMin
                ? () =>
                    setFilters({
                      rwMin: Math.max(30, Number(data.appliedFilters.rwMin) - 6),
                      page: 1,
                    })
                : undefined
            }
          />
        )}

        {!isLoading && data && data.total > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((item) => (
                <ProductCard key={item.product.id} item={item} hasRequirements={hasRequirements} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if ((filters.page ?? 1) > 1) {
                          setFilters({ page: (filters.page ?? 1) - 1 });
                        }
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === (filters.page ?? 1)}
                          onClick={(event) => {
                            event.preventDefault();
                            setFilters({ page });
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if ((filters.page ?? 1) < totalPages) {
                          setFilters({ page: (filters.page ?? 1) + 1 });
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </div>
  );
}
