'use client';

import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import type { ProductListItem } from '@specfinder/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  facePaperColor,
  facePaperLabel,
  formatDimensions,
  formatFireRating,
  formatRw,
  formatWeightPerSqm,
} from '@/lib/format';
import { useSpecification } from '@/hooks/use-specification';

function MatchStrip({
  item,
  hasRequirements,
}: {
  item: ProductListItem;
  hasRequirements: boolean;
}) {
  if (hasRequirements && item.match.criteria.length > 0) {
    return (
      <div className="rounded border border-rule bg-surface-sunken p-3">
        <p className="eyebrow mb-2">Why this matches</p>
        <ul className="space-y-1 text-sm">
          {item.match.criteria.map((criterion) => (
            <li key={criterion.key} className="flex items-start gap-2">
              <Check
                className={`mt-0.5 size-4 shrink-0 ${criterion.status === 'missing' ? 'text-danger' : criterion.status === 'exceeds' ? 'text-exceeds' : 'text-meets'}`}
              />
              <span className={criterion.status === 'exceeds' ? 'text-exceeds' : 'text-ink'}>
                {criterion.key === 'fireResistanceMin'
                  ? formatFireRating(typeof criterion.actual === 'number' ? criterion.actual : null)
                  : criterion.key === 'soundReductionRw'
                    ? formatRw(typeof criterion.actual === 'number' ? criterion.actual : null)
                    : String(criterion.actual)}{' '}
                {criterion.status === 'exceeds'
                  ? 'exceeds'
                  : criterion.status === 'meets'
                    ? 'meets'
                    : 'does not meet'}{' '}
                your requirement
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { performance } = item.product;
  return (
    <div className="font-data grid grid-cols-3 gap-2 text-sm tabular-nums">
      <div>
        <p className="eyebrow mb-1">Fire</p>
        <p>{formatFireRating(performance.fireResistanceMin)}</p>
      </div>
      <div>
        <p className="eyebrow mb-1">Sound</p>
        <p>{formatRw(performance.soundReductionRw)}</p>
      </div>
      <div>
        <p className="eyebrow mb-1">Moisture</p>
        <p>{performance.moistureClass === 'none' ? 'Dry' : performance.moistureClass}</p>
      </div>
    </div>
  );
}

export function ProductCard({
  item,
  hasRequirements,
}: {
  item: ProductListItem;
  hasRequirements: boolean;
}) {
  const { product } = item;
  const { addItem, isInSpecification } = useSpecification();
  const primaryVariant = product.variants[0];
  const inSpec = isInSpecification(product.id);

  return (
    <Card
      className="overflow-hidden rounded border border-rule py-0 shadow-none"
      style={{ borderLeft: `3px solid ${facePaperColor(product.facePaper)}` }}
    >
      <CardHeader className="gap-3 px-4 pt-4 pb-0">
        <div className="flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt=""
            aria-hidden
            className="size-16 shrink-0 rounded border border-rule object-cover"
          />
          <div className="min-w-0">
            <p className="eyebrow">{product.family.toUpperCase()}</p>
            <h2 className="font-display text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-ink-muted">{product.tagline}</p>
            <p className="mt-1 text-xs text-ink-muted">{facePaperLabel(product.facePaper)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <MatchStrip item={item} hasRequirements={hasRequirements} />
        {primaryVariant && (
          <p className="font-data text-sm tabular-nums">
            {formatDimensions(
              primaryVariant.thicknessMm,
              primaryVariant.widthMm,
              primaryVariant.lengthMm,
            )}{' '}
            · {formatWeightPerSqm(primaryVariant.weightPerSqmKg)}
          </p>
        )}
      </CardContent>
      <CardFooter className="gap-2 px-4 pb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/products/${product.slug}`}>View details</Link>
        </Button>
        <Button
          size="sm"
          variant={inSpec ? 'secondary' : 'default'}
          onClick={() => addItem(product)}
        >
          <Plus className="size-4" />
          {inSpec ? 'In specification' : 'Add to specification'}
        </Button>
      </CardFooter>
    </Card>
  );
}
