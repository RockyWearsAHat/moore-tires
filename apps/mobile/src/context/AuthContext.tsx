/**
 * Mobile auth context with AsyncStorage-backed JWT token management.
 * Mirrors the marketing site's AuthContext pattern but uses RN async storage.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  wholesaleAccountId?: string;
  storeLocationId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  token: 'moore_access_token',
  refresh: 'moore_refresh_token',
  user: 'moore_user',
};

export function MobileAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } catch {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { message?: string };
      throw new Error(body.message ?? 'Login failed');
    }

    const { data } = (await res.json()) as {
      data: { accessToken: string; refreshToken: string; user: AuthUser };
    };

    await AsyncStorage.setItem(STORAGE_KEYS.token, data.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.refresh, data.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));

    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refresh);
      if (refreshToken && token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // best-effort
    } finally {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refresh);
      if (!refreshToken) return null;

      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const { data } = (await res.json()) as {
        data: { accessToken: string; refreshToken: string };
      };

      await AsyncStorage.setItem(STORAGE_KEYS.token, data.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.refresh, data.refreshToken);
      setToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  const apiFetch = useCallback(
    async (path: string, init?: RequestInit): Promise<Response> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string>),
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res = await fetch(`${API_URL}${path}`, { ...init, headers });

      if (res.status === 401 && token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(`${API_URL}${path}`, { ...init, headers });
        }
      }

      return res;
    },
    [token, refreshAccessToken]
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMobileAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useMobileAuth must be used within MobileAuthProvider');
  return ctx;
}
