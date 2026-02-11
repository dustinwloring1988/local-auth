import { User } from './types';

const TOKEN_KEY = 'localauth_token';
const USER_KEY = 'localauth_user';

export class TokenManager {
  private token: string | null = null;
  private user: User | null = null;
  private persist: boolean;

  constructor(persist: boolean = true) {
    this.persist = persist;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token) this.token = token;
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch {
          this.user = null;
        }
      }
    } catch {
      this.token = null;
      this.user = null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  setSession(token: string, user: User): void {
    this.token = token;
    this.user = user;

    if (this.persist && typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  clearSession(): void {
    this.token = null;
    this.user = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  hasSession(): boolean {
    return this.token !== null && this.user !== null;
  }
}
