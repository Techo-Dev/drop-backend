import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

	async sendSimpleEmail(to: string, subject: string, html: string) {
	  try {
		await this.mailerService.sendMail({
		  to,
		  subject,
		  html,
		});
		console.log('Email sent successfully');
	  } catch (error) {
		console.error('Error sending email:', error);
		throw new Error('Failed to send email'+error);
	  }
	}
}
