import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SignupParams, SigninParams, UpdateParams } from '../types';
import { authApi } from '../api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    signup: (data: SignupParams) => Promise<void>;
    signin: (data: SigninParams) => Promise<void>;
    updateProfile: (data: UpdateParams) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            setToken(storedToken);
            authApi.getMe(storedToken)
                .then((data) => setUser(data.user))
                .catch(() => {
                    localStorage.removeItem('auth_token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const signup = async (data: SignupParams) => {
        setError(null);
        try {
            const response = await authApi.signup(data);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('auth_token', response.token);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            setError(message);
            throw err;
        }
    };

    const signin = async (data: SigninParams) => {
        setError(null);
        try {
            const response = await authApi.signin(data);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('auth_token', response.token);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signin failed';
            setError(message);
            throw err;
        }
    };

    const updateProfile = async (data: UpdateParams) => {
        if (!token) return;
        setError(null);
        try {
            const response = await authApi.updateMe(token, data);
            setUser(response.user);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Update failed';
            setError(message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                signup,
                signin,
                updateProfile,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
