import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkRequestDto {
  @IsString()
  @IsNotEmpty()
  shop_id: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  freelancer_id?: string;
}
