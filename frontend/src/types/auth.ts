export type UserRole = 'HOSPITAL_ADMIN' | 'PHARMACY_MANAGER' | 'PHARMACIST';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  hospitalId?: number;
  isActive?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  full_name: string;
  email: string;
  hospital_id?: number;
}
