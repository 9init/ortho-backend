import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { Session } from "./auth/entities/session.entity";
import { OtpModule } from "./otp/otp.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { join } from "path";
import { Otp } from "./otp/entities/otp.entity";
import { ScanModule } from "./scan/scan.module";
import { HomeModule } from "./home/home.module";
import { Scan } from "./scan/entities/scan.entity";
import { LoggerMiddleware } from "./middleware/logger.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.MYSQL_DATABASE_HOST,
      port: parseInt(process.env.MYSQL_DATABASE_PORT),
      username: process.env.MYSQL_DATABASE_USER,
      password: process.env.MYSQL_DATABASE_PASSWORD,
      database: process.env.MYSQL_DATABASE_NAME,
      entities: [Session, User, Otp, Scan],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, "templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    OtpModule,
    AuthModule,
    UserModule,
    ScanModule,
    HomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
