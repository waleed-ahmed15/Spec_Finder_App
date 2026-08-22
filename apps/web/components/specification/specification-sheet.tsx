'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Download, FileText, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@specfinder/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
        <section style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #dfe1de;">
          <p style="margin:0 0 4px;font:600 11px/1.4 monospace;letter-spacing:0.08em;text-transform:uppercase;color:#5b6167;">${product.family}</p>
          <h2 style="margin:0 0 8px;font:600 18px/1.2 Archivo, sans-serif;">${product.name}</h2>
          <p style="margin:0 0 8px;font:13px/1.5 monospace;">${formatFireRating(product.performance.fireResistanceMin)} · ${formatRw(product.performance.soundReductionRw)} · ${formatMoisture(product.performance.moistureClass)}</p>
          <p style="margin:0;font-size:13px;">${product.variants.map((v) => v.materialNumber).join(', ')}</p>
        </section>
      `,
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
    <html lang="en"><head><meta charset="utf-8" /><title>Specification</title>
    <style>body{font-family:"IBM Plex Sans",Arial,sans-serif;color:#16191c;padding:32px;max-width:720px;margin:0 auto}h1{font-family:Archivo,Arial,sans-serif;font-size:24px;margin:0 0 8px}.meta{color:#5b6167;font-size:13px;margin-bottom:24px}</style>
    </head><body><h1>Specification</h1><p class="meta">${timestamp} · ${items.length} product${items.length === 1 ? '' : 's'}</p>${rows}</body></html>`);
  printWindow.document.close();
  printWindow.print();
}

function SpecificationRow({
  product,
  onRemove,
  onOpen,
}: {
  product: Product;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const variant = product.variants[0];

  return (
    <li className="group flex items-start gap-3 border-b border-rule py-3 last:border-0">
      <span
        className="mt-1.5 size-2 shrink-0 rounded-full"
        style={{ backgroundColor: facePaperColor(product.facePaper) }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="font-display mb-0.5 line-clamp-2 text-left text-sm font-semibold leading-snug hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {product.name}
        </button>
        <p className="mb-1 text-xs text-ink-muted">{product.family}</p>
        <p className="font-data text-xs tabular-nums text-ink-muted">
          {formatFireRating(product.performance.fireResistanceMin)}
          <span aria-hidden> · </span>
          {formatRw(product.performance.soundReductionRw)}
          <span aria-hidden> · </span>
          {formatMoisture(product.performance.moistureClass)}
        </p>
        {variant && (
          <p className="mt-1 font-data text-xs tabular-nums text-ink">
            {variant.materialNumber}
            {product.variants.length > 1 && (
              <span className="text-ink-muted"> +{product.variants.length - 1} sizes</span>
            )}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 opacity-60 group-hover:opacity-100"
        aria-label={`Remove ${product.name}`}
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

export function SpecificationSheet({ count }: { count: number }) {
  const { items, removeItem } = useSpecification();
  const [, setDetail] = useProductDetailSlug();
  const [open, setOpen] = useState(false);

  const openProduct = (slug: string) => {
    setOpen(false);
    setDetail({ product: slug });
  };

  const exportMarkdown = () => {
    downloadFile(exportSpecificationMarkdown(items), 'specification.md', 'text/markdown');
    toast.success('Exported as Markdown');
  };

  const exportCsv = () => {
    downloadFile(exportSpecificationCsv(items), 'specification.csv', 'text/csv');
    toast.success('Exported as CSV');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11">
          Specification{count > 0 ? ` (${count})` : ''}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        aria-labelledby="specification-sheet-title"
      >
        <SheetHeader className="shrink-0 border-b border-rule px-5 py-4 pr-14">
          <SheetTitle id="specification-sheet-title" className="font-display text-left text-lg">
            Specification
          </SheetTitle>
          {items.length > 0 && (
            <p className="text-left text-sm text-ink-muted">
              {items.length} product{items.length === 1 ? '' : 's'} · ready to export
            </p>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-8">
            <p className="mb-4 text-sm text-ink-muted">
              No products added yet. Use &ldquo;Add to specification&rdquo; on any product to build
              your list.
            </p>
            <Button variant="outline" asChild onClick={() => setOpen(false)}>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
              {items.map((product) => (
                <SpecificationRow
                  key={product.id}
                  product={product}
                  onRemove={() => removeItem(product.id)}
                  onOpen={() => openProduct(product.slug)}
                />
              ))}
            </ul>

            <div className="shrink-0 border-t border-rule px-5 py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="min-h-11 w-full">
                    <Download className="size-4" aria-hidden />
                    Export specification
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={exportMarkdown}>
                    <FileText className="size-4" aria-hidden />
                    Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      printSpecification(items);
                      toast.message('Opening print preview');
                    }}
                  >
                    <Printer className="size-4" aria-hidden />
                    Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
