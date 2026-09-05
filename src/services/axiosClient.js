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

export const BASE_URL = 'https://gavel-backend-nw0p.onrender.com/api/v1';

/* ------------------------------------------------------------------ */
/* In-memory token store (never touches localStorage or sessionStorage) */
/* ------------------------------------------------------------------ */
const tokenStore = {
  accessToken: null,
};

export function setAccessToken(token) {
  tokenStore.accessToken = token;
}

export function getAccessToken() {
  return tokenStore.accessToken;
}

export function clearAccessToken() {
  tokenStore.accessToken = null;
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
  timeout: 15000,
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
