let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

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

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function doRefreshToken(): Promise<string> {
  const res = await fetch('https://dummyjson.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
      expiresInMins: 30,
    }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  return data.accessToken;
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
    const retryPromise = new Promise<Response>((resolve) => {
      refreshSubscribers.push(() => {
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
          Authorization: `Bearer ${accessToken}`,
        };
        resolve(fetch(url, { ...options, headers: retryHeaders }));
      });
    });

    if (!isRefreshing) {
      isRefreshing = true;
      doRefreshToken()
        .then((newToken) => {
          accessToken = newToken;
          onTokenRefreshed(newToken);
        })
        .catch(() => {
          refreshTokenValue = null;
          accessToken = null;
          refreshSubscribers = [];
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
