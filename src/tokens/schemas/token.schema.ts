// src/tokens/schemas/token.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true }) // Removed _id: false
export class Token {
  @Prop({ required: true, type: String })
  _id: string; // Define _id as a string

  @Prop({ required: true })
  access_token: string;

  @Prop({ required: true })
  refresh_token: string;

  @Prop({ required: true })
  token_type: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  account_id: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
