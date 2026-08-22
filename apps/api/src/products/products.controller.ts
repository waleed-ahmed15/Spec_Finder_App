import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get(':slug/documents/:type')
  getDocument(
    @Param('slug') slug: string,
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const document = this.productsService.getDocument(slug, type);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
    return res.send(document.html);
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
