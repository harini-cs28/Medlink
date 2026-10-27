import { UserRole } from './auth';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  hospital_id?: number;
  is_active: boolean;
  created_at?: string;
}

export interface HospitalProfile {
  id: number;
  name: string;
  code: string;
  address?: string;
  contact_number?: string;
}
