import { describe, expect, it } from 'vitest';
import { ProductsQuerySchema } from '@specfinder/shared';
import { queryToSearchParams, searchParamsToQuery } from './query-params';

describe('query-params', () => {
  it('parses valid query params', () => {
    const query = searchParamsToQuery({
      fireMin: '60',
      rwMin: '50',
      application: 'interior_wall,ceiling',
      page: '2',
    });

    expect(query.fireMin).toBe(60);
    expect(query.rwMin).toBe(50);
    expect(query.application).toEqual(['interior_wall', 'ceiling']);
    expect(query.page).toBe(2);
  });

  it('rejects invalid fireMin', () => {
    expect(() =>
      ProductsQuerySchema.parse({
        fireMin: 999,
      }),
    ).toThrow();
  });

  it('serialises filters to URL params', () => {
    const params = queryToSearchParams({
      fireMin: 60,
      rwMin: 50,
      sort: 'relevance',
      page: 1,
      pageSize: 12,
    });

    expect(params.get('fireMin')).toBe('60');
    expect(params.get('rwMin')).toBe('50');
    expect(params.get('sort')).toBeNull();
  });
});
