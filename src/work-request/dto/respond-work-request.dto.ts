import { IsIn } from 'class-validator';

export class RespondWorkRequestDto {
  @IsIn(['accepted', 'rejected'])
  action: 'accepted' | 'rejected';
}
