import { afterEach, describe, expect, it } from 'vitest';
import {
  COMPARE_STORAGE_KEY,
  clearCompareSlugsStorage,
  normalizeCompareSlugs,
  readCompareSlugs,
  writeCompareSlugs,
} from './compare-storage';

describe('compare-storage', () => {
  afterEach(() => {
    clearCompareSlugsStorage();
  });

  it('normalizes, dedupes, and caps slugs', () => {
    expect(
      normalizeCompareSlugs([
        'aurelith-facade-sheathing',
        'aurelith-facade-sheathing',
        'aurelith-acoustic-12-5',
        'aurelith-acoustic-15',
        'extra-product',
      ]),
    ).toEqual(['aurelith-facade-sheathing', 'aurelith-acoustic-12-5', 'aurelith-acoustic-15']);
  });

  it('persists slugs to localStorage', () => {
    writeCompareSlugs(['aurelith-facade-sheathing', 'aurelith-acoustic-12-5']);
    expect(readCompareSlugs()).toEqual(['aurelith-facade-sheathing', 'aurelith-acoustic-12-5']);
    expect(window.localStorage.getItem(COMPARE_STORAGE_KEY)).toBe(
      JSON.stringify(['aurelith-facade-sheathing', 'aurelith-acoustic-12-5']),
    );
  });

  it('returns empty array when storage is missing or invalid', () => {
    expect(readCompareSlugs()).toEqual([]);
    window.localStorage.setItem(COMPARE_STORAGE_KEY, 'not-json');
    expect(readCompareSlugs()).toEqual([]);
  });
});
