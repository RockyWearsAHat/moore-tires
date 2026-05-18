/**
 * Unified auth context + hooks for web + mobile.
 * Zero-trust: token refresh with circuit breaker, auto-logout on failure.
 * Preparation for HttpOnly cookie migration (backend will handle soon).
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthTokens, UserRole } from './index.js';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'moore_auth';
const REFRESH_CIRCUIT_BREAKER_KEY = 'moore_refresh_circuit';
const MAX_REFRESH_FAILURES = 3;
const REFRESH_FAILURE_RESET_TIME = 60_000; // 1 minute

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
}

function getCircuitBreakerState(): CircuitBreakerState {
  try {
    const raw = localStorage.getItem(REFRESH_CIRCUIT_BREAKER_KEY);
    if (!raw) return { failures: 0, lastFailureTime: 0 };
    const parsed = JSON.parse(raw) as CircuitBreakerState;
    // Reset if enough time has passed
    if (Date.now() - parsed.lastFailureTime > REFRESH_FAILURE_RESET_TIME) {
      return { failures: 0, lastFailureTime: 0 };
    }
    return parsed;
  } catch {
    return { failures: 0, lastFailureTime: 0 };
  }
}

function updateCircuitBreakerState(state: CircuitBreakerState) {
  localStorage.setItem(REFRESH_CIRCUIT_BREAKER_KEY, JSON.stringify(state));
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

function persistAuth(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REFRESH_CIRCUIT_BREAKER_KEY);
}

interface AuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
}

export function AuthProvider({ children, apiUrl }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    error: null,
  });

  const baseUrl = apiUrl || 'http://localhost:3001';
  const refreshInProgressRef = useRef(false);

  // Load auth on mount
  useEffect(() => {
    const saved = loadAuth();
    if (saved) {
      setState({ user: saved.user, tokens: saved.tokens, isLoading: false, error: null });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // For future cookie-based auth
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { user: AuthUser; tokens: AuthTokens };
        error?: { message: string };
      };

      if (!res.ok || !json.success) {
        const msg = json.error?.message ?? 'Login failed';
        setState((s) => ({ ...s, error: msg, isLoading: false }));
        throw new Error(msg);
      }

      if (!json.data) {
        setState((s) => ({ ...s, error: 'Invalid response', isLoading: false }));
        throw new Error('Login response missing data');
      }

      const { user, tokens } = json.data;
      persistAuth(user, tokens);
      setState({ user, tokens, isLoading: false, error: null });
      clearCircuitBreaker();
    },
    [baseUrl]
  );

  const logout = useCallback(async () => {
    if (state.tokens?.refreshToken) {
      try {
        await fetch(`${baseUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
          credentials: 'include',
        });
      } catch {
        // Best-effort logout
      }
    }
    clearAuth();
    setState({ user: null, tokens: null, isLoading: false, error: null });
  }, [state.tokens, baseUrl]);

  const clearCircuitBreaker = useCallback(() => {
    localStorage.removeItem(REFRESH_CIRCUIT_BREAKER_KEY);
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!state.tokens?.refreshToken) return false;

    // Check circuit breaker
    const circuit = getCircuitBreakerState();
    if (circuit.failures >= MAX_REFRESH_FAILURES) {
      await logout();
      return false;
    }

    // Prevent concurrent refresh attempts
    if (refreshInProgressRef.current) {
      return false;
    }

    refreshInProgressRef.current = true;
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.tokens.refreshToken }),
        credentials: 'include',
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: AuthTokens;
        error?: { message: string };
      };

      if (!res.ok || !json.success || !json.data) {
        // Increment failure count
        circuit.failures++;
        circuit.lastFailureTime = Date.now();
        updateCircuitBreakerState(circuit);

        if (circuit.failures >= MAX_REFRESH_FAILURES) {
          await logout();
        }
        return false;
      }

      // Success — reset circuit breaker
      clearCircuitBreaker();
      const newTokens = json.data;
      persistAuth(state.user!, newTokens);
      setState((s) => ({ ...s, tokens: newTokens }));
      return true;
    } catch (err) {
      circuit.failures++;
      circuit.lastFailureTime = Date.now();
      updateCircuitBreakerState(circuit);

      if (circuit.failures >= MAX_REFRESH_FAILURES) {
        await logout();
      }
      return false;
    } finally {
      refreshInProgressRef.current = false;
    }
  }, [state.tokens, state.user, baseUrl, logout]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshToken, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
