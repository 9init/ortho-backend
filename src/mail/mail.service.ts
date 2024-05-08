import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import path from "path";
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(email: string, subject: string, message: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: subject,
      template: path.resolve(
        __dirname,
        "..",
        "..",
        "src",
        "mail",
        "templates",
        "info",
      ),
      context: {
        message: message,
      },
    });
  }
}
