import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * useAuth — convenience hook for consuming AuthContext.
 *
 * Throws a clear error if used outside <AuthProvider> so bugs are
 * caught immediately during development.
 *
 * @returns {{
 *   user: object|null,
 *   authLoading: boolean,
 *   authError: string|null,
 *   isAuthenticated: boolean,
 *   roleLabel: string|null,
 *   hasRole: (...roles: string[]) => boolean,
 *   login: (email: string, password: string) => Promise<object>,
 *   logout: () => Promise<void>,
 *   refresh: () => Promise<string|undefined>,
 *   fetchMe: () => Promise<void>,
 *   setAuthError: (error: string|null) => void,
 * }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}

export default useAuth;
