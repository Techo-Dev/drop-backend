import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { DropboxModule } from './dropbox/dropbox.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
	//MongooseModule.forRoot('mongodb://localhost:27017/dropbox-app'),
	MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
	AuthModule,
	//ConfigModule.forRoot(),
	ConfigModule.forRoot({
      isGlobal: true,
    }),
	DropboxModule,
	TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
