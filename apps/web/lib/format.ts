export function formatFireRating(minutes: number | null): string {
  if (minutes === null) return 'Not fire-rated';
  return `EI ${minutes}`;
}

export function formatRw(value: number | null): string {
  if (value === null) return '-';
  return `Rw ${value} dB`;
}

export function formatMoisture(value: string): string {
  if (value === 'none') return 'Dry';
  return value;
}

export function formatDimensions(thicknessMm: number, widthMm: number, lengthMm: number): string {
  return `${thicknessMm} mm · ${widthMm}×${lengthMm}`;
}

export function formatWeightPerSqm(value: number): string {
  return `${value.toFixed(1)} kg/m²`;
}

export function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function facePaperColor(facePaper: string): string {
  switch (facePaper) {
    case 'pink':
      return 'var(--face-fire)';
    case 'green':
      return 'var(--face-moisture)';
    case 'ivory':
      return 'var(--face-standard)';
    case 'grey':
      return 'var(--face-impact)';
    default:
      return 'var(--rule)';
  }
}

export function facePaperLabel(facePaper: string): string {
  switch (facePaper) {
    case 'pink':
      return 'Fire-rated';
    case 'green':
      return 'Moisture-resistant';
    case 'ivory':
      return 'Standard';
    case 'grey':
      return 'Impact-resistant';
    default:
      return 'Unspecified';
  }
}

export function formatMatchValue(
  key: string,
  value: number | string | null,
): string {
  if (value === null) return '-';
  if (key === 'fireResistanceMin' && typeof value === 'number') return formatFireRating(value);
  if (key === 'soundReductionRw' && typeof value === 'number') return formatRw(value);
  if (key === 'moistureClass') return formatMoisture(String(value));
  if (key === 'thicknessMax' && typeof value === 'number') return `${value} mm`;
  return String(value);
}

export function formatMatchRequirement(
  key: string,
  required: number | string,
): string {
  if (key === 'fireResistanceMin') return `EI ${required}`;
  if (key === 'soundReductionRw') return `≥ ${required} dB`;
  if (key === 'moistureClass') return formatMoisture(String(required));
  if (key === 'thicknessMax') return `≤ ${required} mm`;
  return String(required);
}

