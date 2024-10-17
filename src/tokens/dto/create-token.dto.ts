// src/tokens/dto/create-token.dto.ts

import { IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;

  @IsString()
  token_type: string;

  @IsString()
  uid: string;

  @IsString()
  account_id: string;
}
