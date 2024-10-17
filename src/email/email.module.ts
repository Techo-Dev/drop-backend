import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
        // Optional: Configure template options
        /*
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(), // or other adapters
          options: {
            strict: true,
          },
        },
        */
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService], // Ensure EmailService is exported
})
export class MailModule {}
