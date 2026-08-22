'use client';

import { toast } from 'sonner';
import { Check, Download, GitCompare } from 'lucide-react';
import type { DocumentType, Product } from '@specfinder/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentTypeBadge, FieldLabel } from '@/components/glossary/term-tooltip';
import { useSpecification } from '@/hooks/use-specification';
import {
  isDownloadableDocumentType,
  openProductDocument,
} from '@/lib/document-download';
import {
  facePaperColor,
  facePaperLabel,
  formatDate,
  formatDimensions,
  formatFileSize,
  formatFireRating,
  formatMoisture,
  formatRw,
  formatWeightPerSqm,
} from '@/lib/format';
import type { GlossaryTermId } from '@/lib/glossary';
import { cn } from '@/lib/utils';

function FacePaperChip({ facePaper }: { facePaper: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-rule bg-surface px-2 py-0.5 text-xs text-ink-muted">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: facePaperColor(facePaper) }}
        aria-hidden
      />
      {facePaperLabel(facePaper)}
    </span>
  );
}

function TechnicalField({
  label,
  term,
  value,
}: {
  label: string;
  term?: GlossaryTermId;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded border border-rule p-3">
      <dt className="mb-1">
        <FieldLabel term={term}>{label}</FieldLabel>
      </dt>
      <dd className="font-data tabular-nums">{value}</dd>
    </div>
  );
}

function PerformanceMetrics({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const moistureTerm: GlossaryTermId | undefined =
    product.performance.moistureClass === 'H3'
      ? 'H3'
      : product.performance.moistureClass === 'H2'
        ? 'H2'
        : undefined;

  return (
    <dl
      className={cn(
        'grid grid-cols-3 divide-x divide-rule border-y border-rule bg-surface-sunken/80 font-data tabular-nums',
        compact ? 'rounded-md border' : 'rounded border p-4',
      )}
    >
      {(
        [
          { label: 'Fire', term: 'EI' as const, value: formatFireRating(product.performance.fireResistanceMin) },
          { label: 'Sound', term: 'Rw' as const, value: formatRw(product.performance.soundReductionRw) },
          {
            label: 'Moisture',
            term: moistureTerm,
            value: formatMoisture(product.performance.moistureClass),
          },
        ]
      ).map((metric) => (
        <div key={metric.label} className={cn(compact ? 'px-3 py-2.5' : 'px-2')}>
          <FieldLabel term={metric.term} className="mb-0.5 block">
            {metric.label}
          </FieldLabel>
          <dd className={compact ? 'text-sm font-medium text-ink' : 'text-lg'}>{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function handleDocumentAction(product: Product, type: DocumentType) {
  if (isDownloadableDocumentType(type)) {
    openProductDocument(product.slug, type);
    toast.success(`Opening ${type} document`);
    return;
  }

  toast.message('Download not wired in this prototype', {
    description: 'CAD and BIM objects would link to the asset management service in production.',
  });
}

export function ProductDetailActions({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { addItem, isInSpecification, toggleCompare, isInCompare } = useSpecification();
  const inSpec = isInSpecification(product.id);
  const inCompare = isInCompare(product.slug);

  const handleAdd = () => {
    addItem(product);
    toast.success('Added to specification');
  };

  const handleDownloadDatasheet = () => {
    handleDocumentAction(product, 'TDS');
  };

  return (
    <div className={cn('border-t border-rule bg-surface-raised px-5 py-4', className)}>
      {inSpec ? (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary-tint px-3 py-2.5 text-sm font-medium text-primary">
          <Check className="size-4 shrink-0" aria-hidden />
          In your specification
        </div>
      ) : (
        <Button onClick={handleAdd} className="mb-3 min-h-11 w-full">
          Add to specification
        </Button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => toggleCompare(product.slug)}
          className={cn('min-h-10', inCompare && 'border-primary/30 bg-primary-tint text-primary')}
          aria-pressed={inCompare}
        >
          <GitCompare className="size-4" aria-hidden />
          {inCompare ? 'In compare' : 'Compare'}
        </Button>
        <Button variant="outline" onClick={handleDownloadDatasheet} className="min-h-10">
          <Download className="size-4" aria-hidden />
          Datasheet
        </Button>
      </div>
    </div>
  );
}

function SheetVariantSummary({
  product,
  onViewAllSizes,
}: {
  product: Product;
  onViewAllSizes: () => void;
}) {
  const primary = product.variants[0];
  if (!primary) return null;

  const extraCount = product.variants.length - 1;

  return (
    <div className="flex gap-3 rounded-md border border-rule bg-surface-raised p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imageUrl}
        alt=""
        className="size-[4.5rem] shrink-0 rounded border border-rule object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow mb-1">Primary variant</p>
        <p className="font-data text-sm font-medium tabular-nums text-ink">{primary.materialNumber}</p>
        <p className="mt-0.5 font-data text-xs tabular-nums text-ink-muted">
          {formatDimensions(primary.thicknessMm, primary.widthMm, primary.lengthMm)}
          <span aria-hidden> · </span>
          {formatWeightPerSqm(primary.weightPerSqmKg)}
        </p>
        {extraCount > 0 && (
          <button
            type="button"
            onClick={onViewAllSizes}
            className="mt-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            +{extraCount} more {extraCount === 1 ? 'size' : 'sizes'} — view all
          </button>
        )}
      </div>
    </div>
  );
}

function ProductDetailTabs({
  product,
  isSheet,
  activeTab,
  onTabChange,
}: {
  product: Product;
  isSheet: boolean;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}) {
  const tabProps = isSheet
    ? { value: activeTab, onValueChange: onTabChange }
    : { defaultValue: 'technical' as const };

  return (
    <Tabs {...tabProps} className={isSheet ? 'mt-5' : 'mt-10'}>
      <TabsList
        variant={isSheet ? 'line' : 'default'}
        className={cn(
          'max-w-full',
          isSheet
            ? 'mb-1 w-full justify-start gap-4 border-b border-rule pb-0 [&_[data-slot=tabs-trigger]]:shrink-0 [&_[data-slot=tabs-trigger]]:rounded-none [&_[data-slot=tabs-trigger]]:px-0 [&_[data-slot=tabs-trigger]]:pb-2'
            : 'h-auto w-full flex-wrap justify-start',
        )}
      >
        <TabsTrigger value="technical">{isSheet ? 'Technical' : 'Technical data'}</TabsTrigger>
        <TabsTrigger value="variants">{isSheet ? 'Variants' : 'Variants & packaging'}</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="sustainability">{isSheet ? 'EPD' : 'Sustainability'}</TabsTrigger>
      </TabsList>

      <TabsContent value="technical" className="mt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <TechnicalField
            label="Reaction to fire"
            value={product.performance.reactionToFireClass ?? '-'}
          />
          <TechnicalField
            label="Impact resistance"
            value={product.performance.impactResistanceClass ?? '-'}
          />
          <TechnicalField
            label="Thermal conductivity λ"
            term="lambda"
            value={product.performance.thermalConductivity ?? '-'}
          />
          <TechnicalField
            label="Max height"
            value={product.performance.maxHeightM ? `${product.performance.maxHeightM} m` : '-'}
          />
          <TechnicalField label="Edge profile" value={product.edgeProfile} />
          <TechnicalField label="Area of application" value={product.areaOfApplication} />
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">{product.description}</p>
      </TabsContent>

      <TabsContent value="variants" className="mt-4">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material no.</TableHead>
                <TableHead>Width</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Thickness</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>kg/m²</TableHead>
                <TableHead>Pcs/pallet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) => (
                <TableRow key={variant.materialNumber}>
                  <TableCell className="font-data tabular-nums">{variant.materialNumber}</TableCell>
                  <TableCell className="font-data tabular-nums">{variant.widthMm}</TableCell>
                  <TableCell className="font-data tabular-nums">{variant.lengthMm}</TableCell>
                  <TableCell className="font-data tabular-nums">{variant.thicknessMm}</TableCell>
                  <TableCell className="font-data tabular-nums">{variant.weightKg}</TableCell>
                  <TableCell className="font-data tabular-nums">{variant.weightPerSqmKg}</TableCell>
                  <TableCell className="font-data tabular-nums">
                    {variant.piecesPerPallet ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="documents" className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.documents.map((document) => (
              <TableRow key={`${document.type}-${document.title}`}>
                <TableCell>
                  <Badge variant="outline">
                    <DocumentTypeBadge type={document.type} />
                  </Badge>
                </TableCell>
                <TableCell>{document.title}</TableCell>
                <TableCell className="font-data tabular-nums">{formatFileSize(document.sizeKb)}</TableCell>
                <TableCell className="font-data tabular-nums">{document.pages ?? '-'}</TableCell>
                <TableCell className="font-data tabular-nums">{formatDate(document.updatedAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-9"
                    onClick={() => handleDocumentAction(product, document.type)}
                  >
                    <Download className="size-4" aria-hidden />
                    {isDownloadableDocumentType(document.type) ? 'Open' : 'Preview'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="sustainability" className="mt-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <TechnicalField
            label="Recycled content"
            value={
              product.sustainability.recycledContentPct !== null
                ? `${product.sustainability.recycledContentPct}%`
                : '-'
            }
          />
          <TechnicalField
            label="EPD"
            term="EPD"
            value={product.sustainability.hasEpd ? 'Available' : 'Not available'}
          />
        </dl>
      </TabsContent>
    </Tabs>
  );
}

export function ProductDetailPanel({
  product,
  layout = 'page',
  activeTab,
  onTabChange,
}: {
  product: Product;
  layout?: 'page' | 'sheet';
  activeTab?: string;
  onTabChange?: (value: string) => void;
}) {
  const { addItem, isInSpecification, toggleCompare, isInCompare } = useSpecification();
  const isSheet = layout === 'sheet';

  const handleAdd = () => {
    addItem(product);
    toast.success('Added to specification');
  };

  const handleDownloadDatasheet = () => {
    handleDocumentAction(product, 'TDS');
  };

  if (isSheet) {
    return (
      <div className="px-5 pb-6 pt-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FacePaperChip facePaper={product.facePaper} />
          {product.standards.map((standard) => (
            <Badge key={standard} variant="secondary" className="font-data text-xs">
              {standard}
            </Badge>
          ))}
          {product.sustainability.hasEpd && (
            <Badge variant="outline" className="text-xs">
              EPD
            </Badge>
          )}
        </div>

        <SheetVariantSummary
          product={product}
          onViewAllSizes={() => onTabChange?.('variants')}
        />

        <div className="mt-4">
          <PerformanceMetrics product={product} compact />
        </div>

        <ProductDetailTabs
          product={product}
          isSheet
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={`${product.name} board illustration`}
            className="mb-4 w-full rounded border border-rule object-cover"
          />
          <div className="flex flex-wrap gap-2">
            {product.standards.map((standard) => (
              <Badge key={standard} variant="secondary">
                {standard}
              </Badge>
            ))}
            {product.sustainability.hasEpd && <Badge variant="outline">EPD available</Badge>}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">{product.family.toUpperCase()}</p>
          <h1 className="font-display mb-2 text-3xl font-semibold">{product.name}</h1>
          <p className="mb-4 text-lg text-ink-muted">{product.tagline}</p>
          <FacePaperChip facePaper={product.facePaper} />

          <div className="mt-4 mb-6">
            <PerformanceMetrics product={product} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAdd} className="min-h-10">
              {isInSpecification(product.id) ? 'Added to specification' : 'Add to specification'}
            </Button>
            <Button variant="outline" onClick={() => toggleCompare(product.slug)} className="min-h-10">
              {isInCompare(product.slug) ? 'In compare' : 'Add to compare'}
            </Button>
            <Button variant="ghost" onClick={handleDownloadDatasheet} className="min-h-10">
              <Download className="size-4" />
              Download datasheet
            </Button>
          </div>
        </div>
      </div>

      <ProductDetailTabs product={product} isSheet={false} />

      {product.variants[0] && (
        <p className="mt-6 text-sm text-ink-muted">
          Primary variant:{' '}
          <span className="font-data">{product.variants[0].materialNumber}</span>
        </p>
      )}
    </div>
  );
}
