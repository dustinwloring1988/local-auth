export interface User {
    id: string;
    email: string;
    username: string | null;
    full_name: string;
    phone: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    last_sign_in?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface SignupParams {
    email: string;
    username?: string;
    password: string;
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
