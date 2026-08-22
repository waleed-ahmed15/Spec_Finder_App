import { NextRequest, NextResponse } from 'next/server';
import { getProductsService } from '@/lib/products/instance';
import { handleServiceError } from '@/lib/products/route-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const service = getProductsService();
    const result = service.findBySlug(slug);
    return NextResponse.json(result);
  } catch (error) {
    return handleServiceError(error);
  }
}
