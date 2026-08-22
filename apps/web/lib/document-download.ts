import type { DocumentType, Product } from '@specfinder/shared';
import { API_BASE } from '@/lib/api-client';

export const PREVIEWABLE_DOCUMENT_TYPES = [
  'TDS',
  'SDS',
  'DoP',
  'EPD',
  'CAD',
  'BIM',
] as const satisfies readonly DocumentType[];

export type PreviewableDocumentType = (typeof PREVIEWABLE_DOCUMENT_TYPES)[number];

/** @deprecated Use PREVIEWABLE_DOCUMENT_TYPES */
export const DOWNLOADABLE_DOCUMENT_TYPES = PREVIEWABLE_DOCUMENT_TYPES;
export type DownloadableDocumentType = PreviewableDocumentType;

export function isPreviewableDocumentType(type: DocumentType): type is PreviewableDocumentType {
  return (PREVIEWABLE_DOCUMENT_TYPES as readonly DocumentType[]).includes(type);
}

/** @deprecated Use isPreviewableDocumentType */
export function isDownloadableDocumentType(type: DocumentType): type is PreviewableDocumentType {
  return isPreviewableDocumentType(type);
}

export function getProductDocumentUrl(slug: string, type: PreviewableDocumentType): string {
  return `${API_BASE}/products/${encodeURIComponent(slug)}/documents/${type}`;
}

export function openProductDocument(slug: string, type: PreviewableDocumentType): void {
  window.open(getProductDocumentUrl(slug, type), '_blank', 'noopener,noreferrer');
}

export function findProductDocument(product: Product, type: DocumentType) {
  return product.documents.find((document) => document.type === type);
}

export function getPrimaryDatasheet(product: Product) {
  return findProductDocument(product, 'TDS');
}
