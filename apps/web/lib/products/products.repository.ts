import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProductsArraySchema, type Product } from '@specfinder/shared';

export class ProductsRepository {
  private products: Product[] = [];

  load(): void {
    const seedPath = join(process.cwd(), 'data/products.seed.json');
    const raw = readFileSync(seedPath, 'utf-8');
    this.products = ProductsArraySchema.parse(JSON.parse(raw));
  }

  findAll(): Product[] {
    return this.products;
  }

  findBySlug(slug: string): Product | undefined {
    return this.products.find((product) => product.slug === slug);
  }

  findBySlugs(slugs: string[]): Product[] {
    const slugSet = new Set(slugs);
    return this.products.filter((product) => slugSet.has(product.slug));
  }
}
