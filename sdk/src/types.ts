export interface User {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  phone: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastSignIn?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupParams {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface SigninParams {
  email: string;
  password: string;
}

export interface UpdateParams {
  fullName?: string;
  phone?: string;
  username?: string;
  metadata?: Record<string, unknown>;
}

export interface LocalAuthConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}
