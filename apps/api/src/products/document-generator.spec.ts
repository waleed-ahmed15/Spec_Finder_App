import { describe, expect, it } from 'vitest';
import type { Product } from '@specfinder/shared';
import { generateProductDocument } from './document-generator';

const sampleProduct = {
  id: '1',
  slug: 'aurelith-standard-12-5',
  name: 'Aurelith Standard 12.5',
  tagline: 'Everyday interior board',
  description: 'General purpose gypsum board for dry interior walls and ceilings.',
  category: 'gypsum_board',
  family: 'Standard',
  facePaper: 'ivory',
  applications: ['interior_wall', 'ceiling'],
  areaOfApplication: 'interior',
  performance: {
    fireResistanceMin: null,
    reactionToFireClass: 'A2-s1,d0',
    soundReductionRw: 34,
    moistureClass: 'none',
    impactResistanceClass: null,
    thermalConductivity: 0.25,
    maxHeightM: 3.0,
  },
  standards: ['EN 520', 'DIN 18180'],
  sustainability: { recycledContentPct: 12, hasEpd: true },
  edgeProfile: 'tapered',
  variants: [
    {
      materialNumber: '76000001',
      widthMm: 1200,
      lengthMm: 2400,
      thicknessMm: 12.5,
      weightKg: 28.8,
      weightPerSqmKg: 10.0,
      piecesPerPallet: 52,
      coverageSqm: 2.88,
    },
  ],
  documents: [
    {
      type: 'TDS',
      title: 'Aurelith Standard 12.5 technical datasheet',
      fileType: 'PDF',
      sizeKb: 840,
      pages: 12,
      updatedAt: '2025-11-01',
      url: '#',
    },
  ],
  imageUrl: 'data:image/svg+xml,test',
} satisfies Product;

describe('document-generator', () => {
  it('generates a technical datasheet with product identity and performance', () => {
    const result = generateProductDocument(sampleProduct, 'TDS');

    expect(result.filename).toBe('aurelith-aurelith-standard-12-5-tds.html');
    expect(result.html).toContain('Aurelith Standard 12.5');
    expect(result.html).toContain('76000001');
    expect(result.html).toContain('EN 520');
    expect(result.html).toContain('Performance summary');
  });

  it('generates an EPD when the product has one', () => {
    const result = generateProductDocument(sampleProduct, 'EPD');
    expect(result.html).toContain('Environmental summary');
    expect(result.html).toContain('12%');
  });

  it('throws when EPD is requested but unavailable', () => {
    expect(() =>
      generateProductDocument(
        { ...sampleProduct, sustainability: { recycledContentPct: null, hasEpd: false } },
        'EPD',
      ),
    ).toThrow('EPD not available');
  });

  it('generates CAD and BIM preview documents', () => {
    const cad = generateProductDocument(sampleProduct, 'CAD');
    const bim = generateProductDocument(sampleProduct, 'BIM');

    expect(cad.html).toContain('CAD detail package');
    expect(bim.html).toContain('BIM object summary');
  });
});
