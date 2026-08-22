'use client';

import { useState } from 'react';
import { Download, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSpecification } from '@/hooks/use-specification';
import { exportSpecificationCsv, exportSpecificationMarkdown } from '@/lib/export-specification';
import { formatFireRating, formatRw } from '@/lib/format';

export function SpecificationSheet({ count }: { count: number }) {
  const { items, removeItem } = useSpecification();
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    const markdown = exportSpecificationMarkdown(items);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(
      `<pre style="font-family: monospace; white-space: pre-wrap;">${markdown}</pre>`,
    );
    printWindow.document.close();
    printWindow.print();
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11">
          Specification{count > 0 ? ` (${count})` : ''}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="flex w-full flex-col sm:max-w-md"
        aria-labelledby="specification-sheet-title"
      >
        <SheetHeader>
          <SheetTitle id="specification-sheet-title">Specification list</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="px-4 text-sm text-ink-muted">
            No products added yet. Add products from the results list to build a specification.
          </p>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <ul className="space-y-3 pb-4">
                {items.map((product) => (
                  <li
                    key={product.id}
                    className="rounded border border-rule bg-surface-sunken p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display font-semibold">{product.name}</p>
                        <p className="text-ink-muted">{product.family}</p>
                        <p className="font-data mt-1 text-xs tabular-nums">
                          {formatFireRating(product.performance.fireResistanceMin)}
                          <span aria-hidden> · </span>
                          {formatRw(product.performance.soundReductionRw)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${product.name}`}
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="border-t border-rule p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full">
                    <Download className="size-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() =>
                      download(
                        exportSpecificationMarkdown(items),
                        'specification.md',
                        'text/markdown',
                      )
                    }
                  >
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      download(exportSpecificationCsv(items), 'specification.csv', 'text/csv')
                    }
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="size-4" />
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
