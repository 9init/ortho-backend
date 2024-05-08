import { SetMetadata } from "@nestjs/common";
import { OtpType } from "./entities/otp.entity";

export const OTP_KEY = "OTP";
export const RequiredOTP = (...otpType: OtpType[]) =>
  SetMetadata(OTP_KEY, otpType);
