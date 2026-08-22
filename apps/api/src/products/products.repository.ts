import { Injectable } from '@nestjs/common';
import type { Product } from '@specfinder/shared';

@Injectable()
export class ProductsRepository {
  findAll(): Product[] {
    return [];
  }
}
