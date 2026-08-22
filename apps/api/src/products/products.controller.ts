import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.productsService.findAll(query);
  }

  @Get('compare')
  compare(@Query('slugs') slugs: string | string[] | undefined) {
    return this.productsService.compare(slugs);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}

@Controller('facets')
export class FacetsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getFacets() {
    return this.productsService.getFacets();
  }
}
