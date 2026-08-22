import { MAX_COMPARE_PRODUCTS } from '@/lib/compare-url';

export const COMPARE_STORAGE_KEY = 'specfinder:compare-slugs';

const EMPTY_COMPARE_SLUGS: readonly string[] = [];
let cachedCompareSlugs: readonly string[] = EMPTY_COMPARE_SLUGS;
let cachedCompareSlugsKey = '';

function compareSlugsKey(slugs: readonly string[]): string {
  return slugs.join('\0');
}

function cacheCompareSlugs(slugs: string[]): readonly string[] {
  const key = compareSlugsKey(slugs);
  if (key === cachedCompareSlugsKey) {
    return cachedCompareSlugs;
  }
  cachedCompareSlugsKey = key;
  cachedCompareSlugs = slugs.length === 0 ? EMPTY_COMPARE_SLUGS : slugs;
  return cachedCompareSlugs;
}

export function normalizeCompareSlugs(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  const unique = slugs.filter(
    (slug, index): slug is string =>
      typeof slug === 'string' && slug.length > 0 && slugs.indexOf(slug) === index,
  );
  return unique.slice(0, MAX_COMPARE_PRODUCTS);
}

export function readCompareSlugs(): readonly string[] {
  if (typeof window === 'undefined') return EMPTY_COMPARE_SLUGS;
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return EMPTY_COMPARE_SLUGS;
    return cacheCompareSlugs(normalizeCompareSlugs(JSON.parse(raw)));
  } catch {
    return EMPTY_COMPARE_SLUGS;
  }
}

export function writeCompareSlugs(slugs: string[]): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeCompareSlugs(slugs);
  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized));
  notifyCompareSlugs();
}

export function clearCompareSlugsStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(COMPARE_STORAGE_KEY);
  notifyCompareSlugs();
}

type CompareListener = () => void;
const compareListeners = new Set<CompareListener>();

function notifyCompareSlugs(): void {
  compareListeners.forEach((listener) => listener());
}

export function subscribeCompareSlugs(listener: CompareListener): () => void {
  compareListeners.add(listener);

  if (typeof window === 'undefined') {
    return () => compareListeners.delete(listener);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === COMPARE_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener('storage', onStorage);
  return () => {
    compareListeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getCompareSlugsSnapshot(): readonly string[] {
  return readCompareSlugs();
}

export function getCompareSlugsServerSnapshot(): readonly string[] {
  return EMPTY_COMPARE_SLUGS;
}
