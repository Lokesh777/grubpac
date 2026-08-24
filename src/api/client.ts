import { updateStoredRefreshToken, clearSession } from './tokenStorage';

let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  refreshTokenValue = token;
}

export function getRefreshToken(): string | null {
  return refreshTokenValue;
}

function onTokenRefreshed(newToken: string | null) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function doRefreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
  const res = await fetch('https://dummyjson.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
      expiresInMins: 30,
    }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && refreshTokenValue && !url.includes('/auth/')) {
    const retryPromise = new Promise<Response>((resolve, reject) => {
      refreshSubscribers.push((token) => {
        if (!token) {
          reject(new Error('Session expired'));
          return;
        }
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
          Authorization: `Bearer ${token}`,
        };
        resolve(fetch(url, { ...options, headers: retryHeaders }));
      });
    });

    if (!isRefreshing) {
      isRefreshing = true;
      doRefreshToken()
        .then((data) => {
          accessToken = data.accessToken ?? (data as { token?: string }).token ?? '';
          if (!accessToken) throw new Error('Refresh failed');
          if (data.refreshToken) {
            refreshTokenValue = data.refreshToken;
            updateStoredRefreshToken(data.refreshToken);
          }
          onTokenRefreshed(accessToken);
        })
        .catch(() => {
          refreshTokenValue = null;
          accessToken = null;
          onTokenRefreshed(null);
          clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    return retryPromise;
  }

  return res;
}
