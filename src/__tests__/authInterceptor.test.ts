import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAccessToken, setRefreshToken, getAccessToken, getRefreshToken, apiFetch } from '@/api/client';

describe('auth interceptor', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setAccessToken(null);
    setRefreshToken(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should store and retrieve access token', () => {
    setAccessToken('test-token');
    expect(getAccessToken()).toBe('test-token');
  });

  it('should store and retrieve refresh token', () => {
    setRefreshToken('refresh-123');
    expect(getRefreshToken()).toBe('refresh-123');
  });

  it('should attach Authorization header when token is set', async () => {
    setAccessToken('my-token');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    await apiFetch('https://api.example.com/data');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('should not attach Authorization header when no token', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    await apiFetch('https://api.example.com/data');
    const callHeaders = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(callHeaders.Authorization).toBeUndefined();
  });

  it('should set Content-Type to application/json by default', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    await apiFetch('https://api.example.com/test');
    const callHeaders = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(callHeaders['Content-Type']).toBe('application/json');
  });

  it('should attempt token refresh on 401 and retry with new token', async () => {
    setRefreshToken('refresh-token');
    let callCount = 0;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      callCount++;
      if (url.includes('/auth/refresh')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ accessToken: 'new-token', refreshToken: 'new-refresh' }) });
      }
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ message: 'Unauthorized' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: 'ok' }) });
    });
    global.fetch = fetchMock;

    const res = await apiFetch('https://api.example.com/protected');
    const body = await res.json();
    expect(getAccessToken()).toBe('new-token');
    expect(body).toEqual({ data: 'ok' });
  });
});
