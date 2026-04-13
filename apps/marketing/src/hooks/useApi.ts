import { useAuth } from '../context/AuthContext';

const API = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';

/** Fetch wrapper that attaches JWT and handles token refresh on 401. */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(`${API}${path}`, { ...options, headers });
}

/** Hook that provides an authenticated fetch function. */
export function useApiFetch() {
  const { tokens, refreshToken } = useAuth();

  return async (path: string, options: RequestInit = {}) => {
    let res = await apiFetch(path, options, tokens?.accessToken);

    if (res.status === 401 && tokens?.refreshToken) {
      await refreshToken();
      const stored = localStorage.getItem('moore_auth');
      const newToken = stored ? JSON.parse(stored).tokens?.accessToken : null;
      if (newToken) {
        res = await apiFetch(path, options, newToken);
      }
    }

    return res;
  };
}
