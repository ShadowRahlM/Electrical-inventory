export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export type Role =
  | "owner"
  | "manager"
  | "cashier"
  | "store_keeper"
  | "salesperson"
  | "accountant";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
