import { NextRequest, NextResponse } from 'next/server';
import { getProductsService } from '@/lib/products/instance';
import { handleServiceError } from '@/lib/products/route-utils';

export async function GET(request: NextRequest) {
  try {
    const service = getProductsService();
    const slugs = request.nextUrl.searchParams.get('slugs') ?? undefined;
    const result = service.compare(slugs);
    return NextResponse.json(result);
  } catch (error) {
    return handleServiceError(error);
  }
}
