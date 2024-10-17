import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;
  
  @IsOptional()
  @IsString()
  readonly userfolder: string;
  
  @IsNotEmpty()
  @IsString()
  readonly usertype: string;
  
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
