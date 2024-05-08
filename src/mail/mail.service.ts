import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(email: string, subject: string, message: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: subject,
      template: "./info",
      context: {
        message: message,
      },
    });
  }
}
