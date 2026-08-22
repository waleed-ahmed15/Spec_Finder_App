import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  findAll() {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      appliedFilters: {},
    };
  }
}
