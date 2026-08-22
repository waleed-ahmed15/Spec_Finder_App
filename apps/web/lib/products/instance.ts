import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

let service: ProductsService | undefined;

export function getProductsService(): ProductsService {
  if (!service) {
    const repository = new ProductsRepository();
    repository.load();
    service = new ProductsService(repository);
  }
  return service;
}
