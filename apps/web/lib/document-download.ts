import type { DocumentType, Product } from '@specfinder/shared';
import { API_BASE } from '@/lib/api-client';

export const DOWNLOADABLE_DOCUMENT_TYPES = ['TDS', 'SDS', 'DoP', 'EPD'] as const;
export type DownloadableDocumentType = (typeof DOWNLOADABLE_DOCUMENT_TYPES)[number];

export function isDownloadableDocumentType(type: DocumentType): type is DownloadableDocumentType {
  return (DOWNLOADABLE_DOCUMENT_TYPES as readonly DocumentType[]).includes(type);
}

export function getProductDocumentUrl(slug: string, type: DownloadableDocumentType): string {
  return `${API_BASE}/products/${encodeURIComponent(slug)}/documents/${type}`;
}

export function openProductDocument(slug: string, type: DownloadableDocumentType): void {
  window.open(getProductDocumentUrl(slug, type), '_blank', 'noopener,noreferrer');
}

export function findProductDocument(product: Product, type: DocumentType) {
  return product.documents.find((document) => document.type === type);
}

export function getPrimaryDatasheet(product: Product) {
  return findProductDocument(product, 'TDS');
}
