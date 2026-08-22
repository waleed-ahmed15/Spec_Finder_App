import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProductsQuerySchema,
  type Application,
  type FacetsResponse,
  type Product,
  type ProductCategory,
  type ProductListItem,
  type ProductsQuery,
  type ProductsResponse,
} from '@specfinder/shared';
import { ProductsRepository } from './products.repository';
import { buildMatch, rankProducts } from './ranking';

@Injectable()
export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  parseQuery(raw: Record<string, unknown>): ProductsQuery {
    const normalized = this.normalizeQuery(raw);
    const result = ProductsQuerySchema.safeParse(normalized);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid query parameters',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }

  findAll(rawQuery: Record<string, unknown>): ProductsResponse {
    const query = this.parseQuery(rawQuery);
    let products = this.repository.findAll();
    const materialNumberHits = new Set<string>();

    if (query.q) {
      const q = query.q.toLowerCase().trim();
      products = products.filter((product) => {
        const textMatch =
          product.name.toLowerCase().includes(q) ||
          product.tagline.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q);
        const materialMatch = product.variants.some((variant) =>
          variant.materialNumber.includes(q.replace(/\s/g, '')),
        );
        if (materialMatch) materialNumberHits.add(product.id);
        return textMatch || materialMatch;
      });
    }

    if (query.application?.length) {
      products = products.filter((product) =>
        query.application!.some((app) => product.applications.includes(app)),
      );
    }

    if (query.category?.length) {
      products = products.filter((product) =>
        query.category!.includes(product.category),
      );
    }

    const activeFilters = {
      fireMin: query.fireMin,
      rwMin: query.rwMin,
      moisture: query.moisture,
      thicknessMax: query.thicknessMax,
    };

    products = rankProducts(products, activeFilters, materialNumberHits);

    if (query.sort !== 'relevance') {
      products = this.sortProducts(products, query.sort);
    }

    const total = products.length;
    const start = (query.page - 1) * query.pageSize;
    const pageItems = products.slice(start, start + query.pageSize);

    const items: ProductListItem[] = pageItems.map((product) => ({
      product,
      match: buildMatch(product, activeFilters),
    }));

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
      appliedFilters: this.buildAppliedFilters(query),
    };
  }

  findBySlug(slug: string): Product {
    const product = this.repository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }
    return product;
  }

  compare(rawSlugs: string | string[] | undefined): Product[] {
    const slugs = this.parseSlugs(rawSlugs);
    if (slugs.length === 0) {
      throw new BadRequestException('At least one slug is required');
    }
    if (slugs.length > 3) {
      throw new BadRequestException('Compare supports a maximum of 3 products');
    }

    const products = this.repository.findBySlugs(slugs);
    if (products.length !== slugs.length) {
      const found = new Set(products.map((p) => p.slug));
      const missing = slugs.filter((slug) => !found.has(slug));
      throw new NotFoundException(`Products not found: ${missing.join(', ')}`);
    }

    return slugs.map((slug) => products.find((p) => p.slug === slug)!);
  }

  getFacets(): FacetsResponse {
    const products = this.repository.findAll();

    const categoryCounts = new Map<ProductCategory, number>();
    const applicationCounts = new Map<Application, number>();
    const fireCounts = new Map<number, number>();
    const moistureCounts = new Map<string, number>();

    for (const product of products) {
      categoryCounts.set(
        product.category,
        (categoryCounts.get(product.category) ?? 0) + 1,
      );
      for (const app of product.applications) {
        applicationCounts.set(app, (applicationCounts.get(app) ?? 0) + 1);
      }
      if (product.performance.fireResistanceMin !== null) {
        const fire = product.performance.fireResistanceMin;
        fireCounts.set(fire, (fireCounts.get(fire) ?? 0) + 1);
      }
      const moisture = product.performance.moistureClass;
      moistureCounts.set(moisture, (moistureCounts.get(moisture) ?? 0) + 1);
    }

    return {
      categories: [...categoryCounts.entries()].map(([value, count]) => ({
        value,
        count,
      })),
      applications: [...applicationCounts.entries()].map(([value, count]) => ({
        value,
        count,
      })),
      fireResistance: [...fireCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value - b.value),
      moistureClasses: [...moistureCounts.entries()].map(([value, count]) => ({
        value: value as FacetsResponse['moistureClasses'][number]['value'],
        count,
      })),
    };
  }

  private normalizeQuery(
    raw: Record<string, unknown>,
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = { ...raw };

    for (const key of ['application', 'category'] as const) {
      const value = raw[key];
      if (typeof value === 'string' && value.length > 0) {
        normalized[key] = value.split(',');
      }
    }

    if (raw.moisture === 'dry') normalized.moisture = 'none';

    return normalized;
  }

  private sortProducts(
    products: Product[],
    sort: ProductsQuery['sort'],
  ): Product[] {
    const sorted = [...products];
    switch (sort) {
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'fire_desc':
        return sorted.sort(
          (a, b) =>
            (b.performance.fireResistanceMin ?? -1) -
            (a.performance.fireResistanceMin ?? -1),
        );
      case 'rw_desc':
        return sorted.sort(
          (a, b) =>
            (b.performance.soundReductionRw ?? -1) -
            (a.performance.soundReductionRw ?? -1),
        );
      default:
        return sorted;
    }
  }

  private buildAppliedFilters(query: ProductsQuery): Record<string, unknown> {
    const applied: Record<string, unknown> = {};
    if (query.q) applied.q = query.q;
    if (query.application?.length) applied.application = query.application;
    if (query.fireMin !== undefined) applied.fireMin = query.fireMin;
    if (query.rwMin !== undefined) applied.rwMin = query.rwMin;
    if (query.moisture !== undefined) applied.moisture = query.moisture;
    if (query.thicknessMax !== undefined)
      applied.thicknessMax = query.thicknessMax;
    if (query.category?.length) applied.category = query.category;
    return applied;
  }

  private parseSlugs(raw: string | string[] | undefined): string[] {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.flatMap((value) => value.split(',')).filter(Boolean);
    return raw
      .split(',')
      .map((slug) => slug.trim())
      .filter(Boolean);
  }
}
