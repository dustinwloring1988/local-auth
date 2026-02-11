export class LocalAuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'LocalAuthError';
  }
}

export class NetworkError extends LocalAuthError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'NETWORK_ERROR');
  }
}

export class ValidationError extends LocalAuthError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends LocalAuthError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class TokenExpiredError extends LocalAuthError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED', 401);
  }
}
