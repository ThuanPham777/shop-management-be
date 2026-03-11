import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  login: string; // email or phone

  @IsString()
  @IsNotEmpty()
  password: string;
}
