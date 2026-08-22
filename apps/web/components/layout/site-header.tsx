import Link from 'next/link';
import { SiteHeaderClient } from './site-header-client';

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-surface-raised">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/products" className="font-display text-lg font-semibold tracking-tight">
            SpecFinder
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/products" className="text-ink hover:text-primary">
              Products
            </Link>
            <Link href="/compare" className="text-ink hover:text-primary">
              Compare
            </Link>
          </nav>
        </div>
        <SiteHeaderClient />
      </div>
    </header>
  );
}
