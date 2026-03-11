export class ShopResponseDto {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  house_number: string | null;
  street: string | null;
  ward: string | null;
  district: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}
