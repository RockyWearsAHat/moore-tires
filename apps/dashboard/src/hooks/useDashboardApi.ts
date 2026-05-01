import { useDashboardAuth } from '../context/DashboardAuthContext';

const API =
  typeof import.meta.env['VITE_API_URL'] === 'string' && import.meta.env['VITE_API_URL'].length > 0
    ? import.meta.env['VITE_API_URL']
    : 'http://localhost:3001';

/** Authenticated fetch for the dashboard. Auto-refreshes on 401. */
export function useDashboardApi() {
  const { tokens, refreshToken, logout } = useDashboardAuth();

  return async (path: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    let res = await fetch(`${API}${path}`, { ...options, headers });

    if (res.status === 401 && tokens?.refreshToken) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        res = await fetch(`${API}${path}`, { ...options, headers });
      } else {
        await logout();
      }
    }

    return res;
  };
}
