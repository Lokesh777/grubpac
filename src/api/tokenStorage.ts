import type { User } from '@/types';

const SESSION_KEY = 'sprintdesk-session';
const LEGACY_KEY = 'session';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface PersistedSession {
  user: Omit<User, 'token' | 'refreshToken'>;
  refreshToken: string;
  rememberMe: boolean;
  savedAt: number;
}

function stripSecrets(user: User): Omit<User, 'token' | 'refreshToken'> {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    image: user.image,
  };
}

export function saveSession(user: User, refreshToken: string, rememberMe: boolean) {
  const payload: PersistedSession = {
    user: stripSecrets(user),
    refreshToken,
    rememberMe,
    savedAt: Date.now(),
  };
  const json = JSON.stringify(payload);
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, json);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, json);
    localStorage.removeItem(SESSION_KEY);
  }
}

export function loadSession(): PersistedSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as PersistedSession;
    if (session.rememberMe && Date.now() - session.savedAt > THIRTY_DAYS_MS) {
      clearSession();
      return null;
    }
    if (!session.refreshToken) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function updateStoredRefreshToken(refreshToken: string) {
  const session = loadSession();
  if (!session) return;
  saveSession(
    { ...session.user, token: '', refreshToken } as User,
    refreshToken,
    session.rememberMe,
  );
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_KEY);
}
