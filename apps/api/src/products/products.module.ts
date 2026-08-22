import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DevLatencyInterceptor } from '../common/dev-latency.interceptor';
import { FacetsController, ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, FacetsController],
  providers: [
    ProductsService,
    ProductsRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: DevLatencyInterceptor,
    },
  ],
})
export class ProductsModule {}
