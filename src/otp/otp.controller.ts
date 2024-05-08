import { Controller, Post, Body, UseGuards, Param } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { AuthGuard } from "src/auth/auth.guard";
import { LoggedInUser } from "src/user/logged-in-user.decorator";
import { User } from "src/user/entities/user.entity";

@Controller("otp")
@UseGuards(AuthGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("verify/:id")
  verify(
    @Param("id") id: string,
    @Body("otp") otp: string,
    @LoggedInUser() user: User,
  ) {
    return this.otpService.verify(id, otp, user);
  }
}
