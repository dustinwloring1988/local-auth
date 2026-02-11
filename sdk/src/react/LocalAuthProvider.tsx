import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { LocalAuthClient, LocalAuthConfig, SignupParams, SigninParams, UpdateParams, User } from '../types';
import { LocalAuthError, AuthenticationError } from '../errors';

interface AuthContextValue {
  client: LocalAuthClient;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (params: SignupParams) => Promise<void>;
  signIn: (params: SigninParams) => Promise<void>;
  signOut: () => Promise<void>;
  updateMe: (params: UpdateParams) => Promise<void>;
  error: LocalAuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LocalAuthProviderProps {
  children: ReactNode;
  config: LocalAuthConfig;
  persistToken?: boolean;
}

export function LocalAuthProvider({ children, config, persistToken = true }: LocalAuthProviderProps) {
  const [client] = useState(() => new LocalAuthClient(config, persistToken));
  const [user, setUser] = useState<User | null>(client.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<LocalAuthError | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(client.user);
      setIsLoading(false);
    };

    if (client.isAuthenticated) {
      syncUser();
    } else {
      setIsLoading(false);
    }
  }, [client]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUp = useCallback(async (params: SignupParams) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await client.signUp(params);
      setUser(response.user);
    } catch (err) {
      const authError = err instanceof LocalAuthError ? err : new AuthenticationError();
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const signIn = useCallback(async (params: SigninParams) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await client.signIn(params);
      setUser(response.user);
    } catch (err) {
      const authError = err instanceof LocalAuthError ? err : new AuthenticationError();
      setError(authError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await client.signOut();
    } catch (err) {
      const authError = err instanceof LocalAuthError ? err : new AuthenticationError();
      setError(authError);
    } finally {
      setUser(null);
    }
  }, [client]);

  const updateMe = useCallback(async (params: UpdateParams) => {
    setError(null);
    try {
      const response = await client.updateMe(params);
      setUser(response.user);
    } catch (err) {
      const authError = err instanceof LocalAuthError ? err : new AuthenticationError();
      setError(authError);
      throw err;
    }
  }, [client]);

  const value = useMemo<AuthContextValue>(() => ({
    client,
    user,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateMe,
    error,
    clearError,
  }), [client, user, isLoading, signUp, signIn, signOut, updateMe, error, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a LocalAuthProvider');
  }
  return context;
}
