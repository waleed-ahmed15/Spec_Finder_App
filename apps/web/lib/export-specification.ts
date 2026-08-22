import type { Product } from '@specfinder/shared';
import { formatFireRating, formatRw } from '@/lib/format';

export function exportSpecificationMarkdown(items: Product[]): string {
  const timestamp = new Date().toISOString();
  const lines = ['# Aurelith specification export', '', `Generated: ${timestamp}`, ''];

  for (const product of items) {
    lines.push(`## ${product.name}`);
    lines.push(`- Family: ${product.family}`);
    lines.push(`- Fire: ${formatFireRating(product.performance.fireResistanceMin)}`);
    lines.push(`- Sound: ${formatRw(product.performance.soundReductionRw)}`);
    lines.push(
      `- Moisture: ${product.performance.moistureClass === 'none' ? 'Dry' : product.performance.moistureClass}`,
    );
    lines.push(`- Standards: ${product.standards.join(', ') || '-'}`);
    lines.push('- Material numbers:');
    for (const variant of product.variants) {
      lines.push(`  - ${variant.materialNumber} (${variant.thicknessMm} mm)`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportSpecificationCsv(items: Product[]): string {
  const header = [
    'Product name',
    'Family',
    'Material number',
    'Thickness mm',
    'Fire rating',
    'Sound insulation',
    'Moisture class',
    'Standards',
    'Generated at',
  ];
  const timestamp = new Date().toISOString();
  const rows = [header.join(',')];

  for (const product of items) {
    for (const variant of product.variants) {
      rows.push(
        [
          csvEscape(product.name),
          csvEscape(product.family),
          csvEscape(variant.materialNumber),
          variant.thicknessMm,
          csvEscape(formatFireRating(product.performance.fireResistanceMin)),
          csvEscape(formatRw(product.performance.soundReductionRw)),
          csvEscape(product.performance.moistureClass),
          csvEscape(product.standards.join('; ')),
          csvEscape(timestamp),
        ].join(','),
      );
    }
  }

  return rows.join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
