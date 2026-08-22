import type {
  Application,
  MoistureClass,
  ProductCategory,
  ProductsQuery,
  SortOption,
} from '@specfinder/shared';
import { ProductsQuerySchema } from '@specfinder/shared';

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function searchParamsToQuery(searchParams: SearchParamsRecord): ProductsQuery {
  const raw: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      raw[key] = value.length === 1 ? value[0] : value;
    } else {
      raw[key] = value;
    }
  }

  if (typeof raw.application === 'string') raw.application = raw.application.split(',');
  if (typeof raw.category === 'string') raw.category = raw.category.split(',');

  return ProductsQuerySchema.parse(raw);
}

export function queryToSearchParams(query: Partial<ProductsQuery>): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.application?.length) params.set('application', query.application.join(','));
  if (query.fireMin !== undefined) params.set('fireMin', String(query.fireMin));
  if (query.rwMin !== undefined) params.set('rwMin', String(query.rwMin));
  if (query.moisture !== undefined) params.set('moisture', query.moisture);
  if (query.thicknessMax !== undefined) params.set('thicknessMax', String(query.thicknessMax));
  if (query.category?.length) params.set('category', query.category.join(','));
  if (query.sort && query.sort !== 'relevance') params.set('sort', query.sort);
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.pageSize && query.pageSize !== 12) params.set('pageSize', String(query.pageSize));

  return params;
}

export const APPLICATION_LABELS: Record<Application, string> = {
  interior_wall: 'Interior wall',
  ceiling: 'Ceiling',
  floor: 'Floor',
  facade: 'Façade',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  gypsum_board: 'Gypsum boards',
  cement_board: 'Cement boards',
  insulation: 'Insulation',
  ceiling_tile: 'Ceiling tiles',
  profile: 'Profiles',
  filler: 'Fillers',
  accessory: 'Accessories',
};

export const MOISTURE_LABELS: Record<MoistureClass | 'dry', string> = {
  dry: 'Dry',
  none: 'Dry',
  H2: 'Damp (H2)',
  H3: 'Wet (H3)',
};

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Best fit',
  name_asc: 'Name A–Z',
  name_desc: 'Name Z–A',
  fire_desc: 'Fire rating (high to low)',
  rw_desc: 'Sound insulation (high to low)',
};

export const FIRE_OPTIONS = [
  { value: '', label: 'No requirement' },
  { value: '30', label: 'EI 30' },
  { value: '60', label: 'EI 60' },
  { value: '90', label: 'EI 90' },
  { value: '120', label: 'EI 120' },
] as const;
