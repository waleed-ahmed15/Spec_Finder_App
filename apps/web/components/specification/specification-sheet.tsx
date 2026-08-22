'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@specfinder/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProductDetailSlug, useSpecification } from '@/hooks/use-specification';
import { exportSpecificationCsv, exportSpecificationMarkdown } from '@/lib/export-specification';
import {
  facePaperColor,
  formatFireRating,
  formatMoisture,
  formatRw,
} from '@/lib/format';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function printSpecification(items: Product[]) {
  const timestamp = new Date().toLocaleString('en-GB');
  const rows = items
    .map(
      (product) => `
        <section style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #dfe1de;">
          <p style="margin:0 0 4px;font:600 11px/1.4 monospace;letter-spacing:0.08em;text-transform:uppercase;color:#5b6167;">${product.family}</p>
          <h2 style="margin:0 0 8px;font:600 20px/1.2 Archivo, sans-serif;">${product.name}</h2>
          <p style="margin:0 0 12px;color:#5b6167;">${product.tagline}</p>
          <p style="margin:0 0 8px;font:14px/1.5 monospace;">${formatFireRating(product.performance.fireResistanceMin)} · ${formatRw(product.performance.soundReductionRw)} · ${formatMoisture(product.performance.moistureClass)}</p>
          <p style="margin:0 0 4px;font-size:13px;"><strong>Standards:</strong> ${product.standards.join(', ') || '—'}</p>
          <p style="margin:0;font-size:13px;"><strong>Material numbers:</strong> ${product.variants.map((v) => `${v.materialNumber} (${v.thicknessMm} mm)`).join(', ')}</p>
        </section>
      `,
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Aurelith specification</title>
        <style>
          body { font-family: "IBM Plex Sans", Arial, sans-serif; color: #16191c; padding: 32px; max-width: 720px; margin: 0 auto; }
          h1 { font-family: Archivo, Arial, sans-serif; font-size: 28px; margin: 0 0 8px; }
          .meta { color: #5b6167; font-size: 13px; margin-bottom: 32px; }
        </style>
      </head>
      <body>
        <h1>Aurelith specification</h1>
        <p class="meta">Generated ${timestamp} · ${items.length} product${items.length === 1 ? '' : 's'}</p>
        ${rows}
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.print();
}

function SpecificationSummary({ items }: { items: Product[] }) {
  const materialNumberCount = items.reduce((total, product) => total + product.variants.length, 0);

  return (
    <div className="grid grid-cols-3 divide-x divide-rule rounded-md border border-rule bg-surface-sunken/70 font-data text-sm tabular-nums">
      <div className="px-3 py-2.5 text-center">
        <p className="text-lg font-semibold text-ink">{items.length}</p>
        <p className="text-xs text-ink-muted">Products</p>
      </div>
      <div className="px-3 py-2.5 text-center">
        <p className="text-lg font-semibold text-ink">{materialNumberCount}</p>
        <p className="text-xs text-ink-muted">Material nos.</p>
      </div>
      <div className="px-3 py-2.5 text-center">
        <p className="text-lg font-semibold text-primary">Ready</p>
        <p className="text-xs text-ink-muted">To export</p>
      </div>
    </div>
  );
}

function SpecificationItem({
  product,
  index,
  onRemove,
  onOpen,
}: {
  product: Product;
  index: number;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const primaryVariant = product.variants[0];
  const extraVariants = product.variants.length - 1;
  const accent = facePaperColor(product.facePaper);

  return (
    <li
      className="overflow-hidden rounded-md border border-rule bg-surface-raised shadow-sm"
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}, 0 1px 2px rgba(22, 25, 28, 0.04)` }}
    >
      <div className="flex gap-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt=""
          className="size-14 shrink-0 rounded border border-rule object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="eyebrow">Item {index + 1}</p>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 -mt-1 -mr-1"
              aria-label={`Remove ${product.name} from specification`}
              onClick={onRemove}
            >
              <X className="size-4" />
            </Button>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="font-display mb-1 line-clamp-2 text-left text-base leading-snug font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {product.name}
          </button>
          <p className="mb-2 text-xs text-ink-muted">{product.family}</p>

          <div className="mb-2 grid grid-cols-3 gap-1 rounded border border-rule/70 bg-surface-sunken/50 px-2 py-1.5 font-data text-[11px] tabular-nums">
            <span>{formatFireRating(product.performance.fireResistanceMin)}</span>
            <span>{formatRw(product.performance.soundReductionRw)}</span>
            <span>{formatMoisture(product.performance.moistureClass)}</span>
          </div>

          {primaryVariant && (
            <p className="font-data text-xs tabular-nums text-ink-muted">
              {primaryVariant.materialNumber}
              {extraVariants > 0 && ` +${extraVariants} more`}
            </p>
          )}

          {product.standards.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.standards.slice(0, 2).map((standard) => (
                <Badge key={standard} variant="secondary" className="font-data text-[10px]">
                  {standard}
                </Badge>
              ))}
              {product.standards.length > 2 && (
                <Badge variant="outline" className="text-[10px]">
                  +{product.standards.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function SpecificationEmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-5 pb-6">
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-rule bg-surface-sunken/40 px-6 py-10 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-tint">
          <ClipboardList className="size-6 text-primary" aria-hidden />
        </div>
        <h2 className="font-display mb-2 text-lg font-semibold">No products specified yet</h2>
        <p className="mb-6 max-w-xs text-sm text-ink-muted">
          Add compliant products from search results or product detail. Export when ready for tender
          documentation.
        </p>
        <Button asChild onClick={onClose}>
          <Link href="/products">
            Browse products
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function SpecificationSheet({ count }: { count: number }) {
  const { items, removeItem } = useSpecification();
  const [, setDetail] = useProductDetailSlug();
  const [open, setOpen] = useState(false);

  const sortedItems = useMemo(() => items, [items]);

  const openProduct = (slug: string) => {
    setOpen(false);
    setDetail({ product: slug });
  };

  const handleExportMarkdown = () => {
    downloadFile(exportSpecificationMarkdown(items), 'specification.md', 'text/markdown');
    toast.success('Specification exported as Markdown');
  };

  const handleExportCsv = () => {
    downloadFile(exportSpecificationCsv(items), 'specification.csv', 'text/csv');
    toast.success('Specification exported as CSV');
  };

  const handlePrint = () => {
    printSpecification(items);
    toast.message('Opening print preview');
  };

  const handleClearAll = () => {
    items.forEach((product) => removeItem(product.id));
    toast.message('Specification cleared');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={count > 0 ? 'default' : 'outline'}
          size="sm"
          className="min-h-11 gap-2"
        >
          <FileText className="size-4" aria-hidden />
          Specification
          {count > 0 && (
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-semibold tabular-nums">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-full flex-col gap-0 p-0 data-[side=right]:w-[min(520px,92vw)] data-[side=right]:max-w-[min(520px,92vw)]"
        aria-labelledby="specification-sheet-title"
      >
        <SheetHeader className="shrink-0 space-y-3 border-b border-rule px-5 py-4 pr-14">
          <div>
            <p className="eyebrow mb-1 text-primary">Deliverable</p>
            <SheetTitle id="specification-sheet-title" className="font-display text-left text-xl">
              Your specification
            </SheetTitle>
            <p className="mt-1 text-left text-sm text-ink-muted">
              Products named here can be exported for tender documents and project records.
            </p>
          </div>
          {items.length > 0 && <SpecificationSummary items={items} />}
        </SheetHeader>

        {items.length === 0 ? (
          <SpecificationEmptyState onClose={() => setOpen(false)} />
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="space-y-3 px-5 py-4">
                {sortedItems.map((product, index) => (
                  <SpecificationItem
                    key={product.id}
                    product={product}
                    index={index}
                    onRemove={() => {
                      removeItem(product.id);
                      toast.message(`Removed ${product.name}`);
                    }}
                    onOpen={() => openProduct(product.slug)}
                  />
                ))}
              </ul>
            </ScrollArea>

            <div className="shrink-0 space-y-3 border-t border-rule bg-surface-raised px-5 py-4">
              <Button className="min-h-11 w-full" onClick={handleExportMarkdown}>
                <Download className="size-4" aria-hidden />
                Export Markdown
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="min-h-10" onClick={handleExportCsv}>
                  <FileSpreadsheet className="size-4" aria-hidden />
                  CSV
                </Button>
                <Button variant="outline" className="min-h-10" onClick={handlePrint}>
                  <Printer className="size-4" aria-hidden />
                  Print
                </Button>
              </div>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  className="min-h-10 w-full text-ink-muted"
                  onClick={handleClearAll}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Clear specification
                </Button>
              )}
              <p className="text-center text-xs text-ink-muted">
                Markdown for project docs · CSV for schedules · Print for sign-off
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
