'use client';

import { ProductDetailPanel } from '@/components/products/product-detail-panel';
import type { Product } from '@specfinder/shared';

export function ProductDetailView({ product }: { product: Product }) {
  return (
    <main>
      <ProductDetailPanel product={product} layout="page" />
    </main>
  );
}
