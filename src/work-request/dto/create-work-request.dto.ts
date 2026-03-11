import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkRequestDto {
  @IsString()
  @IsNotEmpty()
  shop_id: string;
}
