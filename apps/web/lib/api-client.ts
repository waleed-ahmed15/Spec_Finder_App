const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    next: init?.cache ? undefined : { revalidate: 0 },
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, details);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  getProducts: (searchParams: URLSearchParams) => fetchJson(`/products?${searchParams.toString()}`),
  getProduct: (slug: string) => fetchJson(`/products/${slug}`),
  compareProducts: (slugs: string[]) => fetchJson(`/products/compare?slugs=${slugs.join(',')}`),
  getFacets: () => fetchJson('/facets'),
};

export { API_BASE };
