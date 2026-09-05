import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api.js';
import { setAccessToken, clearAccessToken } from '../services/axiosClient.js';

/**
 * AuthContext — manages authenticated user state and token lifecycle.
 *
 * Access token: held in memory only (via axiosClient's tokenStore).
 * Refresh token: httpOnly cookie, managed by the backend / browser.
 *
 * On mount, attempts a silent token refresh so users don't get logged
 * out on page reload (as long as their refresh cookie is still valid).
 */

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true during initial session restore
  const [authError, setAuthError] = useState(null);

  // Track whether a refresh is in flight so we don't double-trigger
  const refreshingRef = useRef(false);

  /* ---------------------------------------------------------------- */
  /* Silent session restore on mount                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const data = await authApi.refreshToken();
        if (cancelled) return;

        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          // Fetch full profile
          const me = await authApi.me();
          if (!cancelled) setUser(me?.user ?? me);
        }
      } catch {
        // No valid session — stay logged out, that's fine
        if (!cancelled) clearAccessToken();
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Listen for session-expired events from the axios interceptor     */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    function handleSessionExpired() {
      clearAccessToken();
      setUser(null);
    }
    window.addEventListener('gavel:session-expired', handleSessionExpired);
    return () => window.removeEventListener('gavel:session-expired', handleSessionExpired);
  }, []);

  /* ---------------------------------------------------------------- */
  /* login                                                             */
  /* ---------------------------------------------------------------- */
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authApi.login({ email, password });
      // data = { user, accessToken, refreshToken }
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message =
        err.response?.data?.message ?? 'Login failed. Please try again.';
      setAuthError(message);
      throw err;
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* logout                                                            */
  /* ---------------------------------------------------------------- */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — always clear local state regardless
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* refresh (called by interceptor queue — exposed for completeness)  */
  /* ---------------------------------------------------------------- */
  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const data = await authApi.refreshToken();
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* fetchMe (re-fetch user profile, e.g. after profile update)       */
  /* ---------------------------------------------------------------- */
  const fetchMe = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data?.user ?? data);
    } catch {
      // If this fails the user state stays as-is
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /* Derived helpers                                                   */
  /* ---------------------------------------------------------------- */
  const isAuthenticated = Boolean(user);

  /**
   * Role display label mapping:
   *   admin   → Admin
   *   judge   → Legal Aid Officer
   *   clerk   → Records Officer
   *   lawyer  → Volunteer Lawyer
   *   litigant / public → Public Observer
   */
  const ROLE_LABELS = {
    admin: 'Admin',
    judge: 'Legal Aid Officer',
    clerk: 'Records Officer',
    lawyer: 'Volunteer Lawyer',
    litigant: 'Public Observer',
    public: 'Public Observer',
  };

  const roleLabel = user ? (ROLE_LABELS[user.role] ?? user.role) : null;

  const hasRole = useCallback(
    (...roles) => roles.includes(user?.role),
    [user],
  );

  const value = {
    user,
    authLoading,
    authError,
    isAuthenticated,
    roleLabel,
    hasRole,
    login,
    logout,
    refresh,
    fetchMe,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
