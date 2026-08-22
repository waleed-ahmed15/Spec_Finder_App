export function formatFireRating(minutes: number | null): string {
  if (minutes === null) return 'Not fire-rated';
  return `EI ${minutes}`;
}

export function formatRw(value: number | null): string {
  if (value === null) return '—';
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
      return 'Fire-rated board';
    case 'green':
      return 'Moisture-resistant board';
    case 'ivory':
      return 'Standard board';
    case 'grey':
      return 'Impact-resistant board';
    default:
      return 'Unspecified face';
  }
}
