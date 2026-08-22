import { NextResponse } from 'next/server';
import { BadRequestError, NotFoundError } from './errors';

export function handleServiceError(error: unknown): NextResponse {
  if (error instanceof BadRequestError) {
    return NextResponse.json(error.payload, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { message: error.message, statusCode: 404 },
      { status: 404 },
    );
  }
  throw error;
}

export function queryRecord(searchParams: URLSearchParams): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  for (const [key, value] of searchParams.entries()) {
    const existing = query[key];
    if (existing === undefined) {
      query[key] = value;
      continue;
    }
    query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return query;
}
