export interface App {
    id: string;
    name: string;
    description: string;
    api_key: string;
    secret_key: string;
    created_at: string;
    updated_at: string;
    user_count: number;
}

export interface User {
    id: string;
    email: string;
    username: string | null;
    full_name: string;
    phone: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    last_sign_in: string | null;
}
