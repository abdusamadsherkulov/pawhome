'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApiError, apiFetch } from './clientApi';

export type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  role?: 'user' | 'admin';
};

type AuthResult = { user: User; accessToken: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; surname: string; email: string; password: string }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, options?: { method?: string; body?: unknown }) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // When the site opens, try to restore the session using the refresh cookie
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
        const { user } = await apiFetch<{ user: User }>('/auth/me', { token: accessToken });
        setToken(accessToken);
        setUser(user);
      } catch {
        // not logged in, that's fine
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function startSession(result: AuthResult) {
    setUser(result.user);
    setToken(result.accessToken);
  }

  async function login(email: string, password: string) {
    startSession(await apiFetch<AuthResult>('/auth/login', { method: 'POST', body: { email, password } }));
  }

  async function register(data: { name: string; surname: string; email: string; password: string }) {
    startSession(await apiFetch<AuthResult>('/auth/register', { method: 'POST', body: data }));
  }

  async function googleLogin(credential: string) {
    startSession(await apiFetch<AuthResult>('/auth/google', { method: 'POST', body: { credential } }));
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => { });
    setUser(null);
    setToken(null);
  }

  // Calls the API as the logged-in user. If the 15-minute token expired, it
  // refreshes once and retries.
  async function authFetch<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    try {
      return await apiFetch<T>(path, { ...options, token });
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) throw err;
      try {
        const { accessToken } = await apiFetch<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
        setToken(accessToken);
        return await apiFetch<T>(path, { ...options, token: accessToken });
      } catch {
        setUser(null);
        setToken(null);
        throw err;
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}