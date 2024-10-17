// src/tokens/tokens.controller.ts

import { Controller, Get, Post, Body, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './schemas/token.schema';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post()
  async create(@Body() createTokenDto: CreateTokenDto): Promise<Token> {
    return this.tokensService.create(createTokenDto);
  }

  @Get()
  async findOne(): Promise<Token> {
    return this.tokensService.findOne();
  }

  @Put()
  async update(@Body() updateTokenDto: UpdateTokenDto): Promise<Token> {
    return this.tokensService.update(updateTokenDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(): Promise<void> {
    return this.tokensService.delete();
  }
}
