import { describe, expect, it } from 'vitest';
import { formatDimensions, formatFileSize, formatFireRating, formatRw } from './format';

describe('format', () => {
  it('formats fire ratings', () => {
    expect(formatFireRating(90)).toBe('EI 90');
    expect(formatFireRating(null)).toBe('Not fire-rated');
  });

  it('formats Rw values', () => {
    expect(formatRw(54)).toBe('Rw 54 dB');
    expect(formatRw(null)).toBe('—');
  });

  it('formats dimensions with tabular-friendly output', () => {
    expect(formatDimensions(15, 1200, 2400)).toBe('15 mm · 1200×2400');
  });

  it('formats file sizes', () => {
    expect(formatFileSize(840)).toBe('840 KB');
    expect(formatFileSize(2048)).toBe('2.0 MB');
  });
});
