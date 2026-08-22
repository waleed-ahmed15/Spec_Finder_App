import { NextResponse } from 'next/server';
import { getProductsService } from '@/lib/products/instance';

export async function GET() {
  const service = getProductsService();
  return NextResponse.json(service.getFacets());
}
