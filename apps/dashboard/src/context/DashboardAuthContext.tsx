import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthTokens, UserRole } from '@moore-tires/shared';
import { parseJson, type ApiResponse } from '../utils/http';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
}

interface DashboardAuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  /** Zero-trust: check role on every render, not just once. */
  hasRole: (...roles: UserRole[]) => boolean;
}

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(null);

const API =
  typeof import.meta.env['VITE_API_URL'] === 'string' && import.meta.env['VITE_API_URL'].length > 0
    ? import.meta.env['VITE_API_URL']
    : 'http://localhost:3001';
const STORAGE_KEY = 'moore_dashboard_auth';

/** Admin/employee roles that may access the dashboard. */
const DASHBOARD_ROLES: UserRole[] = ['admin', 'district_manager', 'store_employee'];

function persist(user: AuthUser, tokens: AuthTokens) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

function clear() {
  sessionStorage.removeItem(STORAGE_KEY);
}

interface StoredAuth {
  user: AuthUser;
  tokens: AuthTokens;
}

function isStoredAuth(value: unknown): value is StoredAuth {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as {
    user?: { role?: unknown };
    tokens?: { accessToken?: unknown; refreshToken?: unknown };
  };

  return (
    typeof candidate.user?.role === 'string' &&
    DASHBOARD_ROLES.includes(candidate.user.role as UserRole) &&
    typeof candidate.tokens?.accessToken === 'string' &&
    typeof candidate.tokens?.refreshToken === 'string'
  );
}

function load(): { user: AuthUser; tokens: AuthTokens } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!isStoredAuth(data)) {
      clear();
      return null;
    }
    return data;
  } catch {
    clear();
    return null;
  }
}

export function DashboardAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
  });

  useEffect(() => {
    const saved = load();
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
    if (!json.success) {
      throw new Error(json.error?.message ?? 'Login failed');
    }

    const { user, tokens } = json.data;

    // Zero-trust: verify role before granting dashboard access
    if (!DASHBOARD_ROLES.includes(user.role)) {
      throw new Error('You do not have access to the admin dashboard');
    }

    persist(user, tokens);
    setState({ user, tokens, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    if (state.tokens?.refreshToken) {
      try {
        await fetch(`${API}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
        });
      } catch {
        // Best-effort
      }
    }
    clear();
    setState({ user: null, tokens: null, isLoading: false });
  }, [state.tokens]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!state.tokens?.refreshToken) return null;
    try {
      const res = await fetch(`${API}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
      });
      const json = await parseJson<ApiResponse<AuthTokens>>(res);
      if (!res.ok || !json.success) throw new Error();
      const newTokens: AuthTokens = json.data;
      persist(state.user!, newTokens);
      setState((s) => ({ ...s, tokens: newTokens }));
      return newTokens.accessToken;
    } catch {
      clear();
      setState({ user: null, tokens: null, isLoading: false });
      return null;
    }
  }, [state.tokens, state.user]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <DashboardAuthContext.Provider value={{ ...state, login, logout, refreshToken, hasRole }}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  const ctx = useContext(DashboardAuthContext);
  if (!ctx) throw new Error('useDashboardAuth must be used within DashboardAuthProvider');
  return ctx;
}
