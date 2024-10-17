// src/tokens/tokens.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocument } from './schemas/token.schema';
import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Injectable()
export class TokensService {
  constructor(@InjectModel(Token.name) private tokenModel: Model<TokenDocument>) {}

  private readonly FIXED_ID = 'singleton_token'; // Fixed _id for the singleton document

  // Create a new token document
  async create(createTokenDto: CreateTokenDto): Promise<Token> {
    const createdToken = new this.tokenModel({ ...createTokenDto, _id: this.FIXED_ID });
    return createdToken.save();
  }

  // Find the existing token (fixed ID)
  async findOne(): Promise<TokenDocument> {
    const token = await this.tokenModel.findById(this.FIXED_ID);
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    return token;
  }

  // Update the existing token
  async update(updateTokenDto: UpdateTokenDto): Promise<TokenDocument> {
    const updatedToken = await this.tokenModel.findByIdAndUpdate(
      this.FIXED_ID,
      updateTokenDto,
      {
        new: true,
        upsert: true, // Create the document if it doesn't exist
      },
    );
    return updatedToken;
  }

  // Delete the token (optional)
  async delete(): Promise<void> {
    await this.tokenModel.findByIdAndDelete(this.FIXED_ID);
  }
}
