import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Product } from '@specfinder/shared';
import { SiteHeader } from '@/components/layout/site-header';
import { ProductDetailView } from '@/components/products/product-detail-view';
import { apiClient, ApiError } from '@/lib/api-client';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    return (await apiClient.getProduct(slug)) as Product;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found | SpecFinder' };
  return {
    title: `${product.name} | SpecFinder`,
    description: product.tagline,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <ProductDetailView product={product} />
    </>
  );
}
