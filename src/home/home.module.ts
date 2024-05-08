import { Module } from "@nestjs/common";
import { HomeService } from "./home.service";
import { HomeController } from "./home.controller";
import { ScanModule } from "src/scan/scan.module";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [ScanModule, UserModule, AuthModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
