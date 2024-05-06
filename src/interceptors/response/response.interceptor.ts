import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import * as http from "http";

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data: data,
        status:
          http.STATUS_CODES[context.switchToHttp().getResponse().statusCode],
        message: data?.message,
      })),

      catchError((error) => {
        const res = error.response;
        if (typeof res?.message == "string") res.message = [res.message];
        return throwError(() => error);
      }),
    );
  }
}
