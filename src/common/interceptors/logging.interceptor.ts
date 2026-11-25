import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const now = Date.now();

    return next.handle()   // ◄── next.handle() = "baki chain ta chalao" (Express-er next() er moto)
      .pipe(
        tap({    //<-- tap: shudhu dekhe, bodlay na. ejonnoi login tab use kore 
          next: () => {    // ◄── PORE run hoy (controller successfully return korle)
            const response = context.switchToHttp().getResponse();
            const statusCode = response.statusCode;
            const delay = Date.now() - now;
            this.logger.log(
              `[${method}] ${originalUrl} ${statusCode} +${delay}ms`,
            );
          },
          error: (err) => {    // ◄── PORE run hoy (controller throw korle)
            const delay = Date.now() - now;
            this.logger.error(
              `[${method}] ${originalUrl} FAILED +${delay}ms - ${err.message}`,
            );
          },
        }),
      );
  }
}

