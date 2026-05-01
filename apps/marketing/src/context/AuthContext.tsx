import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthTokens } from '@moore-tires/shared';
import { parseJson, type ApiResponse } from '../utils/http';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API =
  typeof import.meta.env['VITE_API_URL'] === 'string' && import.meta.env['VITE_API_URL'].length > 0
    ? import.meta.env['VITE_API_URL']
    : 'http://localhost:3001';
const STORAGE_KEY = 'moore_auth';

function persistAuth(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

interface StoredAuth {
  user: AuthUser;
  tokens: AuthTokens;
}

function isStoredAuth(value: unknown): value is StoredAuth {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as {
    user?: { id?: unknown; role?: unknown };
    tokens?: { accessToken?: unknown; refreshToken?: unknown };
  };

  return (
    typeof candidate.user?.id === 'string' &&
    typeof candidate.user?.role === 'string' &&
    typeof candidate.tokens?.accessToken === 'string' &&
    typeof candidate.tokens?.refreshToken === 'string'
  );
}

function loadAuth(): { user: AuthUser; tokens: AuthTokens } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isStoredAuth(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
  });

  useEffect(() => {
    const saved = loadAuth();
    if (saved) {
      setState({ user: saved.user, tokens: saved.tokens, isLoading: false });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await parseJson<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(res);
    if (!res.ok) {
      const message = !json.success ? json.error?.message : undefined;
      throw new Error(message ?? 'Login failed');
    }
    if (!json.success) throw new Error(json.error?.message ?? 'Login failed');
    const { user, tokens } = json.data;
    persistAuth(user, tokens);
    setState({ user, tokens, isLoading: false });
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await parseJson<ApiResponse<{ user: AuthUser; tokens: AuthTokens }>>(res);
      if (!res.ok) {
        const message = !json.success ? json.error?.message : undefined;
        throw new Error(message ?? 'Registration failed');
      }
      if (!json.success) throw new Error(json.error?.message ?? 'Registration failed');
      const { user, tokens } = json.data;
      persistAuth(user, tokens);
      setState({ user, tokens, isLoading: false });
    },
    []
  );

  const logout = useCallback(async () => {
    if (state.tokens?.refreshToken) {
      try {
        await fetch(`${API}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
        });
      } catch {
        // Best-effort logout
      }
    }
    clearAuth();
    setState({ user: null, tokens: null, isLoading: false });
  }, [state.tokens]);

  const refreshToken = useCallback(async () => {
    if (!state.tokens?.refreshToken) return;
    try {
      const res = await fetch(`${API}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
      });
      const json = await parseJson<ApiResponse<AuthTokens>>(res);
      if (!res.ok || !json.success) throw new Error();
      const newTokens: AuthTokens = json.data;
      const newState = { user: state.user!, tokens: newTokens };
      persistAuth(newState.user, newState.tokens);
      setState((s) => ({ ...s, tokens: newTokens }));
    } catch {
      clearAuth();
      setState({ user: null, tokens: null, isLoading: false });
    }
  }, [state.tokens, state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
