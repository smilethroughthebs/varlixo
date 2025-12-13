import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CurrencyService } from '../../currency/currency.service';

@Injectable()
export class CurrencyContextInterceptor implements NestInterceptor {
  constructor(private readonly currencyService: CurrencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req: any = http.getRequest();

    const headerCurrency = String(req?.headers?.['x-currency'] || req?.headers?.['x-currency-code'] || '')
      .trim()
      .toUpperCase();

    const requestedCurrency = /^[A-Z]{3}$/.test(headerCurrency) ? headerCurrency : undefined;

    return next.handle().pipe(
      mergeMap((data) => {
        const currency = requestedCurrency || 'USD';
        return from(this.currencyService.getExchangeRate('USD', currency)).pipe(
          mergeMap((fx) => {
            const enriched =
              data && typeof data === 'object'
                ? {
                    ...data,
                    fxCurrency: currency,
                    fxRate: fx.rate,
                    fxTimestamp: fx.timestamp,
                    fxIsFallback: fx.isFallback,
                  }
                : {
                    data,
                    fxCurrency: currency,
                    fxRate: fx.rate,
                    fxTimestamp: fx.timestamp,
                    fxIsFallback: fx.isFallback,
                  };
            return of(enriched);
          }),
        );
      }),
    );
  }
}
