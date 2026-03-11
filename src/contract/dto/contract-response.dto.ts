export class ContractResponseDto {
  id: string;
  freelancer_id: string;
  shop_id: string;
  work_request_id: string;
  status: string;
  started_at: Date;
  ended_at: Date | null;
  terminated_by: string | null;
  created_at: Date;
  updated_at: Date;
  shop?: {
    id: string;
    name: string;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
  };
  freelancer?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    avatar_url: string | null;
  };
}
