export class FreelancerAddressDto {
  house_number: string | null;
  street: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
}

export class OwnerProfileResponseDto {
  unique_code: string;
}

export class ProfileResponseDto {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  avatar_url: string | null;
  gender: string;
  roles: string[];
  owner_profile?: OwnerProfileResponseDto;
  freelancer_profile?: FreelancerAddressDto;
}
