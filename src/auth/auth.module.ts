import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { UsersModule } from "src/users/users.module"
import { AuthService } from "./auth.service"
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule,
			JwtModule.register({
			  secret: process.env.JWT_SECRET,
			  signOptions: { expiresIn: '10h' },
			}),
			],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}