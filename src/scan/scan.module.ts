import { Module } from "@nestjs/common";
import { ScanService } from "./scan.service";
import { ScanController } from "./scan.controller";
import { Scan } from "./entities/scan.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Scan]), UserModule, AuthModule],
  controllers: [ScanController],
  providers: [ScanService],
  exports: [ScanService],
})
export class ScanModule {}
