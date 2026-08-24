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
  localStorage.setItem(SESSION_KEY, json);
  if (rememberMe) {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function loadSession(): PersistedSession | null {
  const raw =
    sessionStorage.getItem(SESSION_KEY) ||
    localStorage.getItem(SESSION_KEY) ||
    localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedSession & { user?: PersistedSession['user'] & { refreshToken?: string } };
    const refreshToken = parsed.refreshToken || parsed.user?.refreshToken;
    if (!refreshToken) {
      clearSession();
      return null;
    }
    const session: PersistedSession = {
      user: parsed.user,
      refreshToken,
      rememberMe: parsed.rememberMe ?? true,
      savedAt: parsed.savedAt || Date.now(),
    };
    if (session.rememberMe && Date.now() - session.savedAt > THIRTY_DAYS_MS) {
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
