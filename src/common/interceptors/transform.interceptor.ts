import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler,): Observable<ResponseEnvelope<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle() // ◄── next.handle() = "baki chain ta chalao" (Express-er next() er moto)
      .pipe(
        map((data) => ({   //<-- map: shudhu dekhe, bodlay na. ejonnoi login tab use kore 
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        })),
      );
  }
}

