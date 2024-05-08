import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from "@nestjs/common";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { OtpType } from "src/otp/entities/otp.entity";
import { OTP_KEY } from "src/otp/otp.decorator";
import { OtpService } from "src/otp/otp.service";
import { User } from "src/user/entities/user.entity";

export interface Response<T> {
  data: T;
}

@Injectable()
export class OtpInterceptor<T> implements NestInterceptor<T, Response<T>> {
  @Inject() private reflector: Reflector;
  @Inject() private otpService: OtpService;

  async intercept(context: ExecutionContext, next: CallHandler) {
    const otpTypes = this.reflector.getAllAndOverride<OtpType[]>(OTP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      tap(async () => {
        if (otpTypes?.length) {
          const user = context.switchToHttp().getRequest().user as User;
          await this.otpService.deleteOTPs(user, otpTypes);
        }
      }),
    );
  }
}
