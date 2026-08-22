import { describe, expect, it } from 'vitest';
import { isPreviewableDocumentType } from './document-download';

describe('document-download', () => {
  it('identifies previewable document types', () => {
    expect(isPreviewableDocumentType('TDS')).toBe(true);
    expect(isPreviewableDocumentType('CAD')).toBe(true);
    expect(isPreviewableDocumentType('BIM')).toBe(true);
  });
});
