export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string | null;
  notes?: string | null;
  totalSpent: string | number;
  visitCount: number;
  createdAt: string;
  updatedAt?: string;
  appointments?: any[];
}

export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  fullName?: string;
  phone?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  notes?: string;
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}
