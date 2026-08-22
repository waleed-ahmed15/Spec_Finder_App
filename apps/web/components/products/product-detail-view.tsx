'use client';

import { toast } from 'sonner';
import Link from 'next/link';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpecification } from '@/hooks/use-specification';
import {
  facePaperColor,
  facePaperLabel,
  formatDate,
  formatFileSize,
  formatFireRating,
  formatRw,
} from '@/lib/format';

function MetricTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const definitions: Record<string, string> = {
    EI: 'Fire resistance period in minutes for integrity and insulation.',
    Rw: 'Weighted sound reduction index in decibels.',
    λ: 'Thermal conductivity in watts per metre kelvin.',
    H2: 'Suitable for damp interior areas such as kitchens.',
    H3: 'Suitable for wet rooms with direct moisture exposure.',
    DoP: 'Declaration of Performance under the Construction Products Regulation.',
    EPD: 'Environmental Product Declaration with lifecycle impact data.',
  };

  const key = Object.keys(definitions).find((term) => label.includes(term));
  if (!key) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{definitions[key]}</TooltipContent>
    </Tooltip>
  );
}

export function ProductDetailView({ product }: { product: Product }) {
  const { addItem, isInSpecification, toggleCompare, isInCompare } = useSpecification();
  const primaryVariant = product.variants[0];

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
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
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
          <div
            className="mb-4 inline-flex items-center gap-2 rounded border border-rule px-3 py-1 text-sm"
            style={{ borderLeft: `3px solid ${facePaperColor(product.facePaper)}` }}
          >
            {facePaperLabel(product.facePaper)}
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 rounded border border-rule bg-surface-sunken p-4 font-data tabular-nums">
            <MetricTooltip label="EI">
              <div>
                <p className="eyebrow mb-1">Fire</p>
                <p className="text-lg">{formatFireRating(product.performance.fireResistanceMin)}</p>
              </div>
            </MetricTooltip>
            <MetricTooltip label="Rw">
              <div>
                <p className="eyebrow mb-1">Sound</p>
                <p className="text-lg">{formatRw(product.performance.soundReductionRw)}</p>
              </div>
            </MetricTooltip>
            <div>
              <p className="eyebrow mb-1">Moisture</p>
              <p className="text-lg">
                {product.performance.moistureClass === 'none'
                  ? 'Dry'
                  : product.performance.moistureClass}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAdd}>
              {isInSpecification(product.id) ? 'Added to specification' : 'Add to specification'}
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleCompare(product.slug)}
              disabled={!isInCompare(product.slug) && false}
            >
              {isInCompare(product.slug) ? 'In compare' : 'Add to compare'}
            </Button>
            <Button variant="ghost" onClick={handleDownloadStub}>
              <Download className="size-4" />
              Download datasheet
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="technical" className="mt-10">
        <TabsList>
          <TabsTrigger value="technical">Technical data</TabsTrigger>
          <TabsTrigger value="variants">Variants & packaging</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="mt-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Reaction to fire', product.performance.reactionToFireClass ?? '—'],
              ['Impact resistance', product.performance.impactResistanceClass ?? '—'],
              ['Thermal conductivity λ', product.performance.thermalConductivity ?? '—'],
              [
                'Max height',
                product.performance.maxHeightM ? `${product.performance.maxHeightM} m` : '—',
              ],
              ['Edge profile', product.edgeProfile],
              ['Area of application', product.areaOfApplication],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-rule p-3">
                <dt className="eyebrow mb-1">{label}</dt>
                <dd className="font-data tabular-nums">{value}</dd>
              </div>
            ))}
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
                      {variant.piecesPerPallet ?? '—'}
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
                    <Badge variant="outline">{document.type}</Badge>
                  </TableCell>
                  <TableCell>{document.title}</TableCell>
                  <TableCell className="font-data tabular-nums">
                    {formatFileSize(document.sizeKb)}
                  </TableCell>
                  <TableCell className="font-data tabular-nums">{document.pages ?? '—'}</TableCell>
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
            <div className="rounded border border-rule p-3">
              <dt className="eyebrow mb-1">Recycled content</dt>
              <dd className="font-data tabular-nums">
                {product.sustainability.recycledContentPct !== null
                  ? `${product.sustainability.recycledContentPct}%`
                  : '—'}
              </dd>
            </div>
            <div className="rounded border border-rule p-3">
              <dt className="eyebrow mb-1">EPD</dt>
              <dd>{product.sustainability.hasEpd ? 'Available' : 'Not available'}</dd>
            </div>
          </dl>
        </TabsContent>
      </Tabs>

      {primaryVariant && (
        <p className="mt-6 text-sm text-ink-muted">
          Primary variant: <span className="font-data">{primaryVariant.materialNumber}</span>
        </p>
      )}

      <div className="mt-6">
        <Button variant="link" asChild className="px-0">
          <Link href="/products">Back to results</Link>
        </Button>
      </div>
    </main>
  );
}
