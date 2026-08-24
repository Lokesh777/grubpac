import { refreshUserToken } from '@/api/auth';
import { setAccessToken, setRefreshToken } from '@/api/client';
import { loadSession } from '@/api/tokenStorage';
import { useAuthStore } from '@/stores/authStore';

let inFlight: Promise<void> | null = null;

export function refreshPersistedSession(): Promise<void> {
  if (!inFlight) {
    inFlight = (async () => {
      const stored = loadSession();
      if (!stored?.refreshToken) return;

      setRefreshToken(stored.refreshToken);
      const data = await refreshUserToken(stored.refreshToken);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      useAuthStore.getState().restoreSession(
        {
          ...stored.user,
          token: data.accessToken,
          refreshToken: data.refreshToken,
        },
        stored.rememberMe,
      );
    })()
      .catch(() => {
        // Keep the persisted session so a refresh API blip does not force logout.
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
