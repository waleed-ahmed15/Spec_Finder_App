import { SiteHeader } from '@/components/layout/site-header';
import { ProductsResults } from '@/components/products/products-results';

export const metadata = {
  title: 'Products | SpecFinder',
  description: 'Find building material products that meet your project requirements.',
};

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <div id="main-content">
        <ProductsResults />
      </div>
    </>
  );
}
