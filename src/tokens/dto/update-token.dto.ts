// src/tokens/dto/update-token.dto.ts

import { IsString, IsOptional } from 'class-validator';

export class UpdateTokenDto {
  @IsOptional()
  @IsString()
  access_token?: string;

  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsString()
  token_type?: string;

  @IsOptional()
  @IsString()
  uid?: string;

  @IsOptional()
  @IsString()
  account_id?: string;
}
