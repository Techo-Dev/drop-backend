// src/dropbox/dropbox.module.ts

import { Module } from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { DropboxController } from './dropbox.controller';
import { ConfigModule } from '@nestjs/config';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [ConfigModule, TokensModule],
  providers: [DropboxService],
  controllers: [DropboxController],
  exports: [DropboxService],
})
export class DropboxModule {}
