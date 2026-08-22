import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, delay } from 'rxjs';

@Injectable()
export class DevLatencyInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) return next.handle();
    return next.handle().pipe(delay(400));
  }
}
