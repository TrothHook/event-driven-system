import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev", // default works
        to,
        subject,
        text,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error("Failed to send email", error);
    }
  }
}
