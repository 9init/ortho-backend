import { Controller, Post, Body, Param } from "@nestjs/common";
import { OtpService } from "./otp.service";

@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post(":id/verify")
  verify(@Param("id") id: string, @Body("otp") otp: string) {
    return this.otpService.verify(id, otp);
  }

  @Post(":id/resend")
  resend(@Param("id") id: string) {
    return this.otpService.resentOtp(id);
  }
}
