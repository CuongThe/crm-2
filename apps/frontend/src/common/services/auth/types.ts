export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STAFF';
  phone?: string | null;
  isActive?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'ADMIN' | 'STAFF';
}
