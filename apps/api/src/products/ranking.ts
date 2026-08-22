import type {
  MatchCriterion,
  Product,
  ProductsQuery,
} from '@specfinder/shared';

const DOMAIN_MAX = {
  fireResistanceMin: 120,
  soundReductionRw: 65,
} as const;

export type ActiveFilters = Pick<
  ProductsQuery,
  'fireMin' | 'rwMin' | 'moisture' | 'thicknessMax'
>;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeMatchCriteria(
  product: Product,
  filters: ActiveFilters,
): MatchCriterion[] {
  const criteria: MatchCriterion[] = [];

  if (filters.fireMin !== undefined) {
    const actual = product.performance.fireResistanceMin;
    criteria.push({
      key: 'fireResistanceMin',
      label: 'Fire resistance',
      required: filters.fireMin,
      actual,
      status:
        actual === null
          ? 'missing'
          : actual > filters.fireMin
            ? 'exceeds'
            : actual === filters.fireMin
              ? 'meets'
              : 'missing',
      unit: 'min',
    });
  }

  if (filters.rwMin !== undefined) {
    const actual = product.performance.soundReductionRw;
    criteria.push({
      key: 'soundReductionRw',
      label: 'Sound insulation',
      required: filters.rwMin,
      actual,
      status:
        actual === null
          ? 'missing'
          : actual > filters.rwMin
            ? 'exceeds'
            : actual === filters.rwMin
              ? 'meets'
              : 'missing',
      unit: 'dB',
    });
  }

  if (filters.moisture !== undefined && filters.moisture !== 'none') {
    const actual = product.performance.moistureClass;
    const order = { none: 0, H2: 1, H3: 2 } as const;
    const required = filters.moisture;
    const meets = order[actual] >= order[required];
    criteria.push({
      key: 'moistureClass',
      label: 'Moisture exposure',
      required,
      actual,
      status: meets ? (actual === required ? 'meets' : 'exceeds') : 'missing',
      unit: '',
    });
  }

  if (filters.thicknessMax !== undefined) {
    const minThickness = Math.min(
      ...product.variants.map((v) => v.thicknessMm),
    );
    criteria.push({
      key: 'thicknessMax',
      label: 'Board thickness',
      required: filters.thicknessMax,
      actual: minThickness,
      status: minThickness <= filters.thicknessMax ? 'meets' : 'missing',
      unit: 'mm',
    });
  }

  return criteria;
}

export function passesHardRequirements(
  product: Product,
  filters: ActiveFilters,
): boolean {
  if (filters.fireMin !== undefined) {
    const fire = product.performance.fireResistanceMin;
    if (fire === null || fire < filters.fireMin) return false;
  }

  if (filters.rwMin !== undefined) {
    const rw = product.performance.soundReductionRw;
    if (rw === null || rw < filters.rwMin) return false;
  }

  if (filters.moisture !== undefined && filters.moisture !== 'none') {
    const order = { none: 0, H2: 1, H3: 2 } as const;
    if (order[product.performance.moistureClass] < order[filters.moisture])
      return false;
  }

  if (filters.thicknessMax !== undefined) {
    const hasVariant = product.variants.some(
      (v) => v.thicknessMm <= filters.thicknessMax!,
    );
    if (!hasVariant) return false;
  }

  return true;
}

export function computeScore(product: Product, filters: ActiveFilters): number {
  const numericCriteria: Array<{
    required: number;
    actual: number;
    domainMax: number;
  }> = [];

  if (
    filters.fireMin !== undefined &&
    product.performance.fireResistanceMin !== null
  ) {
    numericCriteria.push({
      required: filters.fireMin,
      actual: product.performance.fireResistanceMin,
      domainMax: DOMAIN_MAX.fireResistanceMin,
    });
  }

  if (
    filters.rwMin !== undefined &&
    product.performance.soundReductionRw !== null
  ) {
    numericCriteria.push({
      required: filters.rwMin,
      actual: product.performance.soundReductionRw,
      domainMax: DOMAIN_MAX.soundReductionRw,
    });
  }

  if (numericCriteria.length === 0) return 1;

  const normalised = numericCriteria.map(({ required, actual, domainMax }) => {
    const excess = actual - required;
    const headroom = domainMax - required;
    if (headroom <= 0) return 0;
    return clamp(excess / headroom, 0, 1);
  });

  const meanExcess =
    normalised.reduce((sum, value) => sum + value, 0) / normalised.length;
  return 1 - meanExcess;
}

export function compareProducts(
  a: Product,
  b: Product,
  filters: ActiveFilters,
  materialNumberHit?: Set<string>,
): number {
  const aMaterialHit = materialNumberHit?.has(a.id) ?? false;
  const bMaterialHit = materialNumberHit?.has(b.id) ?? false;
  if (aMaterialHit !== bMaterialHit) return aMaterialHit ? -1 : 1;

  const scoreDiff = computeScore(b, filters) - computeScore(a, filters);
  if (scoreDiff !== 0) return scoreDiff;

  const variantDiff = a.variants.length - b.variants.length;
  if (variantDiff !== 0) return variantDiff;

  return a.name.localeCompare(b.name);
}

export function rankProducts(
  products: Product[],
  filters: ActiveFilters,
  materialNumberHit?: Set<string>,
): Product[] {
  return [...products]
    .filter((product) => passesHardRequirements(product, filters))
    .sort((a, b) => compareProducts(a, b, filters, materialNumberHit));
}

export function buildMatch(product: Product, filters: ActiveFilters) {
  return {
    score: computeScore(product, filters),
    criteria: computeMatchCriteria(product, filters),
  };
}
