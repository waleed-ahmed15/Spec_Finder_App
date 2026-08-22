'use client';

import { toast } from 'sonner';
import { Download } from 'lucide-react';
import type { Product } from '@specfinder/shared';
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
  facePaperColor,
  facePaperLabel,
  formatDate,
  formatFileSize,
  formatFireRating,
  formatMoisture,
  formatRw,
} from '@/lib/format';
import type { GlossaryTermId } from '@/lib/glossary';
import { cn } from '@/lib/utils';

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

export function ProductDetailPanel({
  product,
  layout = 'page',
}: {
  product: Product;
  layout?: 'page' | 'sheet';
}) {
  const { addItem, isInSpecification, toggleCompare, isInCompare } = useSpecification();
  const primaryVariant = product.variants[0];
  const isSheet = layout === 'sheet';
  const moistureTerm =
    product.performance.moistureClass === 'H3'
      ? 'H3'
      : product.performance.moistureClass === 'H2'
        ? 'H2'
        : undefined;

  const handleAdd = () => {
    addItem(product);
    toast.success('Added to specification');
  };

  const handleDownloadStub = () => {
    toast.message('Download not wired in this prototype', {
      description: 'In production this would link to the PIM document service.',
    });
  };

  return (
    <div className={cn(isSheet ? 'px-4 pb-6 pt-2' : 'mx-auto max-w-7xl px-4 py-6 md:px-6')}>
      <div className={cn('gap-6', isSheet ? 'flex flex-col' : 'grid lg:grid-cols-2 lg:gap-8')}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={`${product.name} board illustration`}
            className={cn(
              'mb-4 w-full rounded border border-rule object-cover',
              isSheet ? 'max-h-48' : '',
            )}
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
          {!isSheet && <p className="eyebrow mb-2">{product.family.toUpperCase()}</p>}
          {!isSheet && (
            <h1 className="font-display mb-2 text-3xl font-semibold">{product.name}</h1>
          )}
          {isSheet && <p className="eyebrow mb-2">{product.family.toUpperCase()}</p>}
          {!isSheet && <p className="mb-4 text-lg text-ink-muted">{product.tagline}</p>}
          <div
            className="mb-4 inline-flex items-center gap-2 rounded border border-rule px-3 py-1 text-sm"
            style={{ borderLeft: `3px solid ${facePaperColor(product.facePaper)}` }}
          >
            {facePaperLabel(product.facePaper)}
          </div>

          <dl className="mb-6 grid grid-cols-3 gap-3 rounded border border-rule bg-surface-sunken p-4 font-data tabular-nums">
            <div>
              <FieldLabel term="EI" className="mb-1 block">
                Fire
              </FieldLabel>
              <dd className={isSheet ? 'text-base' : 'text-lg'}>
                {formatFireRating(product.performance.fireResistanceMin)}
              </dd>
            </div>
            <div>
              <FieldLabel term="Rw" className="mb-1 block">
                Sound
              </FieldLabel>
              <dd className={isSheet ? 'text-base' : 'text-lg'}>
                {formatRw(product.performance.soundReductionRw)}
              </dd>
            </div>
            <div>
              <FieldLabel term={moistureTerm} className="mb-1 block">
                Moisture
              </FieldLabel>
              <dd className={isSheet ? 'text-base' : 'text-lg'}>
                {formatMoisture(product.performance.moistureClass)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAdd} className="min-h-10">
              {isInSpecification(product.id) ? 'Added to specification' : 'Add to specification'}
            </Button>
            <Button variant="outline" onClick={() => toggleCompare(product.slug)} className="min-h-10">
              {isInCompare(product.slug) ? 'In compare' : 'Add to compare'}
            </Button>
            <Button variant="ghost" onClick={handleDownloadStub} className="min-h-10">
              <Download className="size-4" />
              Download datasheet
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="technical" className={isSheet ? 'mt-6' : 'mt-10'}>
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="technical">Technical data</TabsTrigger>
          <TabsTrigger value="variants">Variants & packaging</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
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
          <p className="mt-4 text-sm text-ink-muted">{product.description}</p>
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
                    <TableCell className="font-data tabular-nums">
                      {variant.materialNumber}
                    </TableCell>
                    <TableCell className="font-data tabular-nums">{variant.widthMm}</TableCell>
                    <TableCell className="font-data tabular-nums">{variant.lengthMm}</TableCell>
                    <TableCell className="font-data tabular-nums">{variant.thicknessMm}</TableCell>
                    <TableCell className="font-data tabular-nums">{variant.weightKg}</TableCell>
                    <TableCell className="font-data tabular-nums">
                      {variant.weightPerSqmKg}
                    </TableCell>
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
                  <TableCell className="font-data tabular-nums">
                    {formatFileSize(document.sizeKb)}
                  </TableCell>
                  <TableCell className="font-data tabular-nums">{document.pages ?? '-'}</TableCell>
                  <TableCell className="font-data tabular-nums">
                    {formatDate(document.updatedAt)}
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

      {primaryVariant && (
        <p className="mt-6 text-sm text-ink-muted">
          Primary variant:{' '}
          <span className="font-data">{primaryVariant.materialNumber}</span>
        </p>
      )}
    </div>
  );
}
