import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, registerUser, getCurrentUser } from '../services/api';
import type {User} from "../types.ts";

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (u: string, p: string) => Promise<void>;
    register: (u: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> =
    ({ children }) =>
{
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();
                setUser(user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const u = await loginUser(username, password);
        setUser(u);
    };

    const register = async (username: string, password: string) => {
        const u = await registerUser(username, password);
        setUser(u);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
