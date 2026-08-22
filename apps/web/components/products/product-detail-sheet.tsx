'use client';

import { useQuery } from '@tanstack/react-query';
import type { Product } from '@specfinder/shared';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetailPanel } from '@/components/products/product-detail-panel';
import { apiClient } from '@/lib/api-client';
import { useProductDetailSlug } from '@/hooks/use-specification';

export function ProductDetailSheet({
  previewProduct,
}: {
  previewProduct?: Product | null;
}) {
  const [{ product: slug }, setDetail] = useProductDetailSlug();
  const open = Boolean(slug);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    enabled: Boolean(slug),
    queryFn: () => apiClient.getProduct(slug!) as Promise<Product>,
    initialData: previewProduct?.slug === slug ? previewProduct : undefined,
  });

  const close = () => setDetail({ product: null });

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <SheetContent
        side="right"
        className="flex h-full flex-col gap-0 p-0 data-[side=right]:w-[min(840px,92vw)] data-[side=right]:max-w-[min(840px,92vw)]"
        aria-labelledby="product-detail-sheet-title"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-rule px-5 py-4 pr-14">
          <SheetTitle id="product-detail-sheet-title" className="font-display text-left text-xl">
            {data?.name ?? 'Product details'}
          </SheetTitle>
          {data?.tagline && (
            <p className="text-left text-sm text-ink-muted">{data.tagline}</p>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {isLoading && !data && (
            <div className="space-y-4 px-5 py-4">
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full rounded" />
            </div>
          )}

          {isError && !data && (
            <p className="px-5 py-6 text-sm text-danger">Could not load product details.</p>
          )}

          {data && <ProductDetailPanel product={data} layout="sheet" />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
