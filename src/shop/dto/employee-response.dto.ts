export class EmployeeResponseDto {
  contract_id: string;
  freelancer_id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  status: string;
  started_at: Date;
}
