'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@specfinder/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/glossary/term-tooltip';
import { apiClient } from '@/lib/api-client';
import { facePaperColor, formatFireRating, formatRw } from '@/lib/format';
import type { GlossaryTermId } from '@/lib/glossary';
import { useCompareSlugsParam } from '@/hooks/use-specification';

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
    term: 'H2',
    getValue: (p) => (p.performance.moistureClass === 'none' ? 'Dry' : p.performance.moistureClass),
  },
  {
    key: 'variants',
    label: 'Variant count',
    term: 'variants',
    getValue: (p) => String(p.variants.length),
  },
  {
    key: 'epd',
    label: 'EPD',
    term: 'EPD',
    getValue: (p) => (p.sustainability.hasEpd ? 'Yes' : 'No'),
  },
];

export function CompareView() {
  const [{ compare }] = useCompareSlugsParam();
  const slugs = compare ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['compare', slugs.join(',')],
    enabled: slugs.length > 0,
    queryFn: () => apiClient.compareProducts(slugs) as Promise<Product[]>,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <h1 className="font-display mb-2 text-3xl font-semibold">Compare products</h1>
      <p className="mb-6 text-ink-muted">Compare up to three products side by side.</p>

      {slugs.length === 0 && (
        <div className="rounded border border-rule bg-surface-raised p-8 text-center">
          <p className="mb-4 text-ink-muted">
            No products selected. Add products from the results page to compare.
          </p>
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      )}

      {slugs.length > 0 && isLoading && <p>Loading comparison…</p>}
      {isError && <p className="text-danger">Could not load comparison.</p>}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded border border-rule">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-surface-raised">Attribute</TableHead>
                {data.map((product) => (
                  <TableHead
                    key={product.id}
                    style={{ borderTop: `3px solid ${facePaperColor(product.facePaper)}` }}
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-display hover:text-primary"
                    >
                      {product.name}
                    </Link>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => {
                const values = data.map((product) => row.getValue(product));
                const allSame = values.every((value) => value === values[0]);
                return (
                  <TableRow key={row.key}>
                    <TableCell className="sticky left-0 z-10 bg-surface-raised font-medium">
                      <FieldLabel term={row.term} variant="default">
                        {row.label}
                      </FieldLabel>
                    </TableCell>
                    {data.map((product, index) => (
                      <TableCell
                        key={product.id}
                        className={`font-data tabular-nums ${allSame ? 'text-ink-muted' : 'font-medium text-ink'}`}
                      >
                        {values[index]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
