import { NextRequest, NextResponse } from 'next/server';
import { getProductsService } from '@/lib/products/instance';
import { handleServiceError, queryRecord } from '@/lib/products/route-utils';

export async function GET(request: NextRequest) {
  try {
    const service = getProductsService();
    const result = service.findAll(queryRecord(request.nextUrl.searchParams));
    return NextResponse.json(result);
  } catch (error) {
    return handleServiceError(error);
  }
}
