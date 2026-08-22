import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductsArraySchema, type Product } from '@specfinder/shared';

@Injectable()
export class ProductsRepository implements OnModuleInit {
  private products: Product[] = [];

  onModuleInit() {
    this.load();
  }

  load(): void {
    const seedPath = join(__dirname, '../../data/products.seed.json');
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
