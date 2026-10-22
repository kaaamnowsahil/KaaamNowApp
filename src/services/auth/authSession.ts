import { revokeRefreshToken } from './authApi';
import { useAuthStore } from './useAuthStore';

/** Revoke the server refresh token when possible, then always clear local credentials. */
export async function logoutAuthSession() {
  const { tokens, signOut } = useAuthStore.getState();
  try {
    if (tokens?.refresh_token && tokens.access_token) {
      await revokeRefreshToken(tokens.refresh_token, tokens.access_token);
    }
  } catch {
    // Always clear the secure local session when the server is unavailable.
  } finally {
    await signOut();
  }
}
