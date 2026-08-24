import { apiFetch } from './client';
import type { User } from '@/types';

interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(username: string, password: string): Promise<User> {
  const res = await apiFetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  const data: LoginResponse = await res.json();
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    image: data.image,
    token: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export async function refreshUserToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch('https://dummyjson.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json();
  return {
    accessToken: data.accessToken ?? data.token,
    refreshToken: data.refreshToken ?? refreshToken,
  };
}
