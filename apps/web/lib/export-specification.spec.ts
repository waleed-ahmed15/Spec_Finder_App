import { describe, expect, it } from 'vitest';
import type { Product } from '@specfinder/shared';
import { exportSpecificationCsv, exportSpecificationMarkdown } from './export-specification';

const sample: Product[] = [
  {
    id: '1',
    slug: 'test',
    name: 'Aurelith Test',
    tagline: 'Test',
    description: 'Test',
    category: 'gypsum_board',
    family: 'Test family',
    facePaper: 'pink',
    applications: ['interior_wall'],
    areaOfApplication: 'interior',
    performance: {
      fireResistanceMin: 90,
      reactionToFireClass: 'A2-s1,d0',
      soundReductionRw: 54,
      moistureClass: 'none',
      impactResistanceClass: null,
      thermalConductivity: 0.25,
      maxHeightM: 3,
    },
    standards: ['EN 520 Type F'],
    sustainability: { recycledContentPct: 20, hasEpd: true },
    edgeProfile: 'tapered',
    variants: [
      {
        materialNumber: '00767843',
        widthMm: 1200,
        lengthMm: 2400,
        thicknessMm: 15,
        weightKg: 28,
        weightPerSqmKg: 12,
        piecesPerPallet: 50,
        coverageSqm: 2.88,
      },
    ],
    documents: [],
    imageUrl: '/test.svg',
  },
];

describe('export-specification', () => {
  it('exports markdown with key fields', () => {
    const md = exportSpecificationMarkdown(sample);
    expect(md).toContain('Aurelith Test');
    expect(md).toContain('00767843');
    expect(md).toContain('EN 520 Type F');
  });

  it('exports csv with header and row', () => {
    const csv = exportSpecificationCsv(sample);
    expect(csv.split('\n')[0]).toContain('Product name');
    expect(csv).toContain('Aurelith Test');
    expect(csv).toContain('00767843');
  });
});
