/**
 * ==============================================
 * VARLIXO - TRANSFORM INTERCEPTOR
 * ==============================================
 * Wraps all responses in a consistent format.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CurrencyService } from '../../currency/currency.service';

// Standard response format
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  fxCurrency?: string;
  fxRate?: number;
  fxTimestamp?: number;
  fxIsFallback?: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly currencyService?: CurrencyService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req: any = context.switchToHttp()?.getRequest?.();
    const headerCurrency = String(req?.headers?.['x-currency'] || req?.headers?.['x-currency-code'] || '')
      .trim()
      .toUpperCase();
    const currency = /^[A-Z]{3}$/.test(headerCurrency) ? headerCurrency : 'USD';

    return next.handle().pipe(
      mergeMap((data) => {
        if (!this.currencyService) {
          return of({
            success: true,
            data,
            timestamp: new Date().toISOString(),
          } as any);
        }

        return from(this.currencyService.getExchangeRate('USD', currency)).pipe(
          mergeMap((fx) =>
            of({
              success: true,
              data,
              timestamp: new Date().toISOString(),
              fxCurrency: currency,
              fxRate: fx.rate,
              fxTimestamp: fx.timestamp,
              fxIsFallback: fx.isFallback,
            } as any),
          ),
        );
      }),
    );
  }
}




