import { NextRequest, NextResponse } from 'next/server';
import { getProductsService } from '@/lib/products/instance';
import { handleServiceError } from '@/lib/products/route-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; type: string }> },
) {
  try {
    const { slug, type } = await params;
    const service = getProductsService();
    const document = service.getDocument(slug, type);
    return new NextResponse(document.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${document.filename}"`,
      },
    });
  } catch (error) {
    return handleServiceError(error);
  }
}
