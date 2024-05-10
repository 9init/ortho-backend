import { Module, forwardRef } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Otp } from "./entities/otp.entity";
import { UserModule } from "src/user/user.module";
import { OtpInterceptor } from "./otp.interceptor";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([User, Otp]),
    MailModule,
  ],
  controllers: [OtpController],
  providers: [OtpService, OtpInterceptor],
  exports: [OtpService],
})
export class OtpModule {}
