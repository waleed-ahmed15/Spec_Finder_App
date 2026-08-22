export type GlossaryTermId =
  | 'EI'
  | 'Rw'
  | 'lambda'
  | 'H2'
  | 'H3'
  | 'DoP'
  | 'EPD'
  | 'TDS'
  | 'SDS'
  | 'CAD'
  | 'BIM'
  | 'reactionToFire'
  | 'materialNumber'
  | 'recycledContent'
  | 'variants';

export const GLOSSARY: Record<GlossaryTermId, string> = {
  EI: 'Fire resistance period in minutes for integrity and insulation.',
  Rw: 'Weighted sound reduction index in decibels - higher values mean better sound insulation.',
  lambda: 'Thermal conductivity in watts per metre kelvin - lower values mean better insulation.',
  H2: 'Moisture class for damp interior areas such as kitchens and bathrooms.',
  H3: 'Moisture class for wet rooms with direct moisture or tile exposure.',
  DoP: 'Declaration of Performance required under the Construction Products Regulation.',
  EPD: 'Environmental Product Declaration with third-party verified lifecycle impact data.',
  TDS: 'Technical datasheet with performance data and application guidance.',
  SDS: 'Safety datasheet with handling, storage, and hazard information.',
  CAD: 'CAD detail drawings for inclusion in project documentation.',
  BIM: 'BIM object for use in digital building models (stubbed in this prototype).',
  reactionToFire:
    'Reaction to fire classification per EN 13501-1 - describes how a material contributes to fire.',
  materialNumber: 'Manufacturer SKU used by installers and merchants to order the exact variant.',
  recycledContent: 'Percentage of pre- or post-consumer recycled material in the product.',
  variants:
    'Other thickness and dimension options for this product, each with its own material number.',
};

export const GLOSSARY_DISPLAY: Partial<Record<GlossaryTermId, string>> = {
  lambda: 'λ',
  variants: 'Sizes',
};

export function glossaryDisplayLabel(term: GlossaryTermId): string {
  return GLOSSARY_DISPLAY[term] ?? term;
}

/** Map match criterion keys to glossary terms */
export function criterionGlossaryTerm(
  key: string,
  actual?: string | number | null,
): GlossaryTermId | null {
  switch (key) {
    case 'fireResistanceMin':
      return 'EI';
    case 'soundReductionRw':
      return 'Rw';
    case 'moistureClass':
      if (actual === 'H3') return 'H3';
      if (actual === 'H2') return 'H2';
      return 'H2';
    default:
      return null;
  }
}

/** Map document types to glossary terms */
export function documentGlossaryTerm(type: string): GlossaryTermId | null {
  if (type in GLOSSARY) return type as GlossaryTermId;
  return null;
}
