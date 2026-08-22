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
  | 'BIM';

export const GLOSSARY: Record<GlossaryTermId, string> = {
  EI: 'Fire resistance period in minutes for integrity and insulation.',
  Rw: 'Weighted sound reduction index in decibels — higher values mean better sound insulation.',
  lambda: 'Thermal conductivity in watts per metre kelvin — lower values mean better insulation.',
  H2: 'Moisture class for damp interior areas such as kitchens and bathrooms.',
  H3: 'Moisture class for wet rooms with direct moisture or tile exposure.',
  DoP: 'Declaration of Performance required under the Construction Products Regulation.',
  EPD: 'Environmental Product Declaration with third-party verified lifecycle impact data.',
  TDS: 'Technical datasheet with performance data and application guidance.',
  SDS: 'Safety datasheet with handling, storage, and hazard information.',
  CAD: 'CAD detail drawings for inclusion in project documentation.',
  BIM: 'BIM object for use in digital building models (stubbed in this prototype).',
};

export const GLOSSARY_DISPLAY: Partial<Record<GlossaryTermId, string>> = {
  lambda: 'λ',
};

export function glossaryDisplayLabel(term: GlossaryTermId): string {
  return GLOSSARY_DISPLAY[term] ?? term;
}
