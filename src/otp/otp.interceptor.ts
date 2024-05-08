import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from "@nestjs/common";
import { throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import * as http from "http";
import { Reflector } from "@nestjs/core";
import { OtpType } from "src/otp/entities/otp.entity";
import { OTP_KEY } from "src/otp/otp.decorator";
import { OtpService } from "src/otp/otp.service";
import { User } from "src/user/entities/user.entity";

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  @Inject() private reflector: Reflector;
  @Inject() private otpService: OtpService;

  async intercept(context: ExecutionContext, next: CallHandler) {
    const otpTypes = this.reflector.getAllAndOverride<OtpType[]>(OTP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      map((data) => {
        if (otpTypes?.length) {
          const user = context.switchToHttp().getRequest().user as User;
          this.otpService.deleteOTPs(user, otpTypes);
        }

        return {
          data: data,
          status:
            http.STATUS_CODES[context.switchToHttp().getResponse().statusCode],
          message: data?.message,
        };
      }),

      catchError((error) => {
        const res = error.response;
        if (typeof res?.message == "string") res.message = [res.message];
        return throwError(() => error);
      }),
    );
  }
}
