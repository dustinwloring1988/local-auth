import {
  LocalAuthConfig,
  AuthResponse,
  SignupParams,
  SigninParams,
  UpdateParams,
  User,
  RequestOptions,
} from './types';
import { TokenManager } from './tokenManager';
import {
  LocalAuthError,
  NetworkError,
  ValidationError,
  AuthenticationError,
} from './errors';

export class LocalAuthClient {
  private config: Required<LocalAuthConfig>;
  private tokenManager: TokenManager;
  private requestCache: Map<string, { response: unknown; timestamp: number }>;

  constructor(config: LocalAuthConfig, persistToken: boolean = true) {
    this.config = {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl || 'http://localhost:3001',
    };
    this.tokenManager = new TokenManager(persistToken);
    this.requestCache = new Map();
  }

  get token(): string | null {
    return this.tokenManager.getToken();
  }

  get user(): User | null {
    return this.tokenManager.getUser();
  }

  get isAuthenticated(): boolean {
    return this.tokenManager.hasSession();
  }

  async signUp(params: SignupParams): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: params,
    });

    this.tokenManager.setSession(response.token, response.user);
    return response;
  }

  async signIn(params: SigninParams): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: params,
    });

    this.tokenManager.setSession(response.token, response.user);
    return response;
  }

  async signOut(): Promise<void> {
    try {
      await this.request('/api/auth/signout', { method: 'POST' });
    } catch {
    } finally {
      this.tokenManager.clearSession();
    }
  }

  async getMe(): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>('/api/auth/me', {
      method: 'GET',
    });

    const currentUser = this.tokenManager.getUser();
    if (currentUser) {
      this.tokenManager.setSession(this.tokenManager.getToken()!, response.user);
    }

    return response;
  }

  async updateMe(params: UpdateParams): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>('/api/auth/me', {
      method: 'PUT',
      body: params,
    });

    this.tokenManager.setSession(this.tokenManager.getToken()!, response.user);
    return response;
  }

  setSession(token: string, user: User): void {
    this.tokenManager.setSession(token, user);
  }

  clearSession(): void {
    this.tokenManager.clearSession();
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
      ...options.headers,
    };

    if (this.token && !options.headers?.['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        let errorData: { error?: string } = { error: 'Unknown error' };

        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}` };
        }

        const errorMessage = errorData.error || `HTTP ${response.status}`;

        switch (response.status) {
          case 400:
            throw new ValidationError(errorMessage);
          case 401:
            if (errorMessage.includes('expired')) {
              throw new AuthenticationError('Token has expired');
            }
            throw new AuthenticationError(errorMessage);
          case 404:
            throw new LocalAuthError(errorMessage, 'NOT_FOUND', 404);
          case 409:
            throw new LocalAuthError(errorMessage, 'CONFLICT', 409);
          default:
            throw new LocalAuthError(errorMessage, 'SERVER_ERROR', response.status);
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof LocalAuthError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TypeError') {
        throw new NetworkError('Network request failed', error);
      }

      throw new LocalAuthError('An unexpected error occurred');
    }
  }
}
