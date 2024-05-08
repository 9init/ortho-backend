import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { OtpService } from "./otp.service";
import { Observable } from "rxjs";
import { Reflector } from "@nestjs/core";
import { OtpType } from "./entities/otp.entity";
import { OTP_KEY } from "./otp.decorator";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class OtpGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private otpService: OtpService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const otpTypes = this.reflector.getAllAndOverride<OtpType[]>(OTP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!otpTypes?.length) return true;

    const user = context.switchToHttp().getRequest().user as User;

    const expiresAtIfVerified = new Date(Date.now() - 1000 * 60 * 5);
    user.otps = user.otps.filter(
      (otp) =>
        !otp.isUsed &&
        (otp.expiresAt > new Date() || expiresAtIfVerified > new Date()),
    );

    return this.isSubSet(
      otpTypes,
      user.otps.map((otp) => otp.type),
    );
  }

  isSubSet<T = any>(parent: T[], sub: T[]) {
    return sub.every((element) => {
      return parent.includes(element);
    });
  }
}
