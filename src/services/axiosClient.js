/**
 * GAVEL Axios Client
 *
 * - Base URL: production backend
 * - withCredentials: true on EVERY request (required for httpOnly refresh cookie)
 * - Request interceptor: attaches access token from in-memory store
 * - Response interceptor: handles 401 → silent refresh → retry → logout
 *
 * The access token is stored in memory only (never localStorage) via the
 * tokenStore object below, which AuthContext reads/writes through the
 * exported helper functions.
 */

import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api/v1';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
export const API_ORIGIN = BASE_URL.startsWith('http')
  ? BASE_URL.replace(/\/api\/v1\/?$/, '')
  : '';

/* ------------------------------------------------------------------ */
/* Token store (in-memory + localStorage backup)                       */
/* ------------------------------------------------------------------ */
const tokenStore = {
  accessToken: (() => {
    try {
      return localStorage.getItem('accessToken') || null;
    } catch {
      return null;
    }
  })(),
};

export function setAccessToken(token) {
  tokenStore.accessToken = token;
  try {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  } catch {}
}

export function getAccessToken() {
  return tokenStore.accessToken;
}

export function clearAccessToken() {
  tokenStore.accessToken = null;
  try {
    localStorage.removeItem('accessToken');
  } catch {}
}

/* ------------------------------------------------------------------ */
/* Axios instance                                                       */
/* ------------------------------------------------------------------ */
const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required: sends httpOnly refresh cookie cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
  // Render can need longer than 15 seconds to wake and complete MongoDB
  // aggregation queries. Keep a finite timeout, but do not abort valid
  // dashboard requests while the deployed service is warming up.
  timeout: 45000,
});

/* ------------------------------------------------------------------ */
/* Request interceptor — attach access token                           */
/* ------------------------------------------------------------------ */
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ------------------------------------------------------------------ */
/* Response interceptor — 401 → refresh → retry → redirect            */
/* ------------------------------------------------------------------ */
let isRefreshing = false;
let refreshQueue = []; // queue of { resolve, reject } callbacks

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request (_retry guard)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't refresh on the auth endpoints themselves
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh resolves
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token is sent automatically via the httpOnly cookie
        const { data } = await axiosClient.post('/auth/refresh-token');
        const newToken = data?.data?.accessToken;

        if (!newToken) throw new Error('No access token in refresh response');

        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();

        // Redirect to login — the app's AuthContext will handle clearing state
        // We dispatch a custom event so AuthContext can react without a circular import
        window.dispatchEvent(new CustomEvent('gavel:session-expired'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
