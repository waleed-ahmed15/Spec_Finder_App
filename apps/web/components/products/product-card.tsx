'use client';

import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { MatchCriterion, ProductListItem, Variant } from '@specfinder/shared';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FieldLabel, TermTooltip } from '@/components/glossary/term-tooltip';
import {
  facePaperColor,
  facePaperLabel,
  formatDimensions,
  formatFireRating,
  formatMatchRequirement,
  formatMatchValue,
  formatMoisture,
  formatRw,
  formatWeightPerSqm,
} from '@/lib/format';
import { criterionGlossaryTerm } from '@/lib/glossary';
import { useSpecification } from '@/hooks/use-specification';

function FacePaperBadge({ facePaper }: { facePaper: string }) {
  const color = facePaperColor(facePaper);
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-rule bg-surface px-2 py-0.5 text-xs text-ink-muted">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {facePaperLabel(facePaper)}
    </span>
  );
}

function FitBadge({ criteria }: { criteria: MatchCriterion[] }) {
  const allExact = criteria.length > 0 && criteria.every((c) => c.status === 'meets');
  if (!allExact) return null;

  return (
    <span className="rounded border border-primary/20 bg-primary-tint px-2 py-0.5 text-xs font-medium text-primary">
      Exact fit
    </span>
  );
}

function MatchCriterionRow({ criterion }: { criterion: MatchCriterion }) {
  const value = formatMatchValue(criterion.key, criterion.actual);
  const isMissing = criterion.status === 'missing';
  const isExceeds = criterion.status === 'exceeds';

  let statusText = '';
  if (isMissing) {
    statusText = 'does not meet requirement';
  } else if (isExceeds) {
    statusText = `exceeds your ${formatMatchRequirement(criterion.key, criterion.required)}`;
  } else {
    statusText =
      criterion.key === 'moistureClass'
        ? 'meets exposure requirement'
        : `meets your ${formatMatchRequirement(criterion.key, criterion.required)}`;
  }

  const glossaryTerm = criterionGlossaryTerm(criterion.key, criterion.actual);

  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-rule/60 py-1.5 last:border-0">
      <span className="flex items-center gap-2 font-data text-sm tabular-nums">
        <Check
          className={cn(
            'size-3.5 shrink-0',
            isMissing ? 'text-danger' : isExceeds ? 'text-exceeds' : 'text-meets',
          )}
          aria-hidden
        />
        {glossaryTerm ? (
          <TermTooltip term={glossaryTerm}>
            <span className={isMissing ? 'text-ink-muted line-through' : 'text-ink'}>{value}</span>
          </TermTooltip>
        ) : (
          <span className={isMissing ? 'text-ink-muted line-through' : 'text-ink'}>{value}</span>
        )}
      </span>
      <span
        className={cn(
          'text-right text-xs',
          isMissing ? 'text-danger' : isExceeds ? 'text-exceeds' : 'text-meets',
        )}
      >
        {statusText}
      </span>
    </li>
  );
}

function ComplianceStrip({
  item,
  hasRequirements,
}: {
  item: ProductListItem;
  hasRequirements: boolean;
}) {
  if (hasRequirements && item.match.criteria.length > 0) {
    return (
      <div className="border-y border-rule bg-surface-sunken/60 px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="eyebrow">Why this matches</p>
          <FitBadge criteria={item.match.criteria} />
        </div>
        <ul>
          {item.match.criteria.map((criterion) => (
            <MatchCriterionRow key={criterion.key} criterion={criterion} />
          ))}
        </ul>
      </div>
    );
  }

  const { performance } = item.product;
  const moistureTerm =
    performance.moistureClass === 'H3'
      ? ('H3' as const)
      : performance.moistureClass === 'H2'
        ? ('H2' as const)
        : undefined;

  const metrics = [
    { label: 'Fire', term: 'EI' as const, value: formatFireRating(performance.fireResistanceMin) },
    { label: 'Sound', term: 'Rw' as const, value: formatRw(performance.soundReductionRw) },
    { label: 'Moisture', term: moistureTerm, value: formatMoisture(performance.moistureClass) },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-rule border-y border-rule bg-surface-sunken/40">
      {metrics.map((metric) => (
        <div key={metric.label} className="px-3 py-2.5">
          <FieldLabel term={metric.term} className="mb-0.5 block">
            {metric.label}
          </FieldLabel>
          <p className="font-data text-sm tabular-nums">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

function AdditionalSizesTooltip({ variants }: { variants: Variant[] }) {
  const additional = variants.slice(1);
  if (additional.length === 0) return null;

  const sizeList = additional.map((variant) =>
    formatDimensions(variant.thicknessMm, variant.widthMm, variant.lengthMm),
  );
  const ariaLabel = `Also available in ${additional.length} sizes: ${sizeList.join(', ')}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'ml-2 cursor-help rounded bg-surface-sunken px-1.5 py-0.5',
            'border-b border-dotted border-ink-muted/40 underline-offset-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          )}
          tabIndex={0}
          aria-label={ariaLabel}
        >
          +{additional.length} sizes
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-0 text-left leading-snug">
        <div className="px-3 py-2">
          <p className="mb-1.5 font-medium">Also available</p>
          <ul className="space-y-0.5 font-data tabular-nums">
            {additional.map((variant) => (
              <li key={variant.materialNumber}>
                {formatDimensions(variant.thicknessMm, variant.widthMm, variant.lengthMm)}
              </li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function VariantMeta({
  materialNumber,
  thicknessMm,
  widthMm,
  lengthMm,
  weightPerSqmKg,
  variants,
}: {
  materialNumber: string;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  weightPerSqmKg: number;
  variants: Variant[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5">
      <p className="font-data text-xs tabular-nums text-ink-muted">
        <span className="text-ink">{formatDimensions(thicknessMm, widthMm, lengthMm)}</span>
        <span aria-hidden> · </span>
        {formatWeightPerSqm(weightPerSqmKg)}
      </p>
      <p className="font-data text-xs text-ink-muted">
        <TermTooltip term="materialNumber">
          <span className="text-ink">{materialNumber}</span>
        </TermTooltip>
        {variants.length > 1 && <AdditionalSizesTooltip variants={variants} />}
      </p>
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
  const faceColor = facePaperColor(product.facePaper);

  const handleAddToSpec = () => {
    if (inSpec) return;
    addItem(product);
    toast.success('Added to specification');
  };

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded border border-rule bg-surface-raised',
        'transition-[border-color,background-color] duration-150',
        'hover:border-ink-muted/30 hover:bg-surface',
        'focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20',
      )}
      style={{ boxShadow: `inset 3px 0 0 0 ${faceColor}` }}
    >

      {/* Identity */}
      <div className="flex gap-3 px-4 pt-4 pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          aria-hidden
          className="size-14 shrink-0 rounded border border-rule object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <p className="eyebrow">{product.family}</p>
            <FacePaperBadge facePaper={product.facePaper} />
          </div>
          <h2 className="font-display text-lg leading-tight font-semibold tracking-tight">
            <Link
              href={`/products/${product.slug}`}
              className="text-ink hover:text-primary focus-visible:underline focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink-muted">{product.tagline}</p>
        </div>
      </div>

      {/* Evidence - the card's reason to exist */}
      <ComplianceStrip item={item} hasRequirements={hasRequirements} />

      {primaryVariant && (
        <VariantMeta
          materialNumber={primaryVariant.materialNumber}
          thicknessMm={primaryVariant.thicknessMm}
          widthMm={primaryVariant.widthMm}
          lengthMm={primaryVariant.lengthMm}
          weightPerSqmKg={primaryVariant.weightPerSqmKg}
          variants={product.variants}
        />
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2 border-t border-rule px-4 py-3">
        <Button variant="outline" size="sm" className="min-h-10 flex-1" asChild>
          <Link href={`/products/${product.slug}`}>View details</Link>
        </Button>
        <Button
          size="sm"
          className={cn('min-h-10 flex-1', inSpec && 'bg-primary-tint text-primary hover:bg-primary-tint')}
          variant={inSpec ? 'secondary' : 'default'}
          onClick={handleAddToSpec}
          aria-pressed={inSpec}
          disabled={inSpec}
        >
          {inSpec ? (
            <>
              <Check className="size-4" aria-hidden />
              Added
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden />
              Add to specification
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
