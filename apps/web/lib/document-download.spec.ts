import { describe, expect, it } from 'vitest';
import { isDownloadableDocumentType } from './document-download';

describe('document-download', () => {
  it('identifies downloadable document types', () => {
    expect(isDownloadableDocumentType('TDS')).toBe(true);
    expect(isDownloadableDocumentType('CAD')).toBe(false);
    expect(isDownloadableDocumentType('BIM')).toBe(false);
  });
});
