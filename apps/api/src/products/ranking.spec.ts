import { describe, expect, it } from 'vitest';
import type { Product } from '@specfinder/shared';
import { computeScore, passesHardRequirements, rankProducts } from './ranking';

function makeProduct(
  overrides: Partial<Product['performance']> & { variants?: number },
): Product {
  return {
    id: 'test',
    slug: 'test',
    name: 'Test Product',
    tagline: 'Test',
    description: 'Test',
    category: 'gypsum_board',
    family: 'Test',
    facePaper: 'ivory',
    applications: ['interior_wall'],
    areaOfApplication: 'interior',
    performance: {
      fireResistanceMin: 60,
      reactionToFireClass: 'A2-s1,d0',
      soundReductionRw: 50,
      moistureClass: 'none',
      impactResistanceClass: null,
      thermalConductivity: 0.25,
      maxHeightM: 3,
      ...overrides,
    },
    standards: [],
    sustainability: { recycledContentPct: 10, hasEpd: true },
    edgeProfile: 'tapered',
    variants: Array.from({ length: overrides.variants ?? 2 }, (_, i) => ({
      materialNumber: `0000000${i}`,
      widthMm: 1200,
      lengthMm: 2400,
      thicknessMm: 12.5,
      weightKg: 28,
      weightPerSqmKg: 10,
      piecesPerPallet: 50,
      coverageSqm: 2.88,
    })),
    documents: [],
    imageUrl: '/test.svg',
  };
}

describe('ranking', () => {
  it('fireMin=60 returns products with 60, 90, and 120', () => {
    const products = [
      makeProduct({ fireResistanceMin: 60 }),
      makeProduct({ fireResistanceMin: 90 }),
      makeProduct({ fireResistanceMin: 120 }),
      makeProduct({ fireResistanceMin: 30 }),
      makeProduct({ fireResistanceMin: null }),
    ].map((product, index) => ({
      ...product,
      id: `p-${index}`,
      name: `Product ${index}`,
    }));

    const ranked = rankProducts(products, { fireMin: 60 });
    expect(ranked).toHaveLength(3);
    expect(ranked.map((p) => p.performance.fireResistanceMin)).toEqual([
      60, 90, 120,
    ]);
  });

  it('ranks least over-specified first', () => {
    const exact = makeProduct({ fireResistanceMin: 60, variants: 2 });
    const over = makeProduct({ fireResistanceMin: 120, variants: 2 });
    exact.id = 'exact';
    exact.name = 'Exact';
    over.id = 'over';
    over.name = 'Over';

    const ranked = rankProducts([over, exact], { fireMin: 60 });
    expect(ranked[0]?.id).toBe('exact');
    expect(computeScore(exact, { fireMin: 60 })).toBeGreaterThan(
      computeScore(over, { fireMin: 60 }),
    );
  });

  it('excludes products failing hard requirements', () => {
    const product = makeProduct({ fireResistanceMin: 30 });
    expect(passesHardRequirements(product, { fireMin: 60 })).toBe(false);
  });

  it('moisture H2 filter accepts H2 and H3', () => {
    const h2 = makeProduct({ moistureClass: 'H2' });
    const h3 = makeProduct({ moistureClass: 'H3' });
    const none = makeProduct({ moistureClass: 'none' });

    expect(passesHardRequirements(h2, { moisture: 'H2' })).toBe(true);
    expect(passesHardRequirements(h3, { moisture: 'H2' })).toBe(true);
    expect(passesHardRequirements(none, { moisture: 'H2' })).toBe(false);
  });

  it('returns score 1 when no numeric criteria active', () => {
    const product = makeProduct({});
    expect(computeScore(product, {})).toBe(1);
  });

  it('tie-breaks on fewest variants then alphabetically', () => {
    const fewer = makeProduct({ fireResistanceMin: 60, variants: 1 });
    const more = makeProduct({ fireResistanceMin: 60, variants: 4 });
    fewer.id = 'fewer';
    fewer.name = 'Alpha';
    more.id = 'more';
    more.name = 'Beta';

    const ranked = rankProducts([more, fewer], { fireMin: 60 });
    expect(ranked[0]?.id).toBe('fewer');
  });
});
