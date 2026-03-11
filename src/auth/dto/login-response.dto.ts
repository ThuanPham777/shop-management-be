export class UserResponseDto {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  roles: string[];
}

export class LoginResponseDto {
  access_token: string;
  user: UserResponseDto;
}
