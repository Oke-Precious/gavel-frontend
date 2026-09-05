/**
 * GAVEL API — all endpoint functions.
 *
 * Each function unwraps the standard { success, message, data } envelope
 * and returns the `data` field directly.
 *
 * Error handling: Axios errors bubble up to the caller (useApi hook or
 * component). The caller is responsible for distinguishing network vs 4xx vs 5xx.
 *
 * Role mapping (backend → UI display label):
 *   admin   → Admin
 *   judge   → Legal Aid Officer
 *   clerk   → Records Officer
 *   lawyer  → Volunteer Lawyer
 *   litigant / public → Public Observer
 */

import axiosClient from './axiosClient.js';

/* ------------------------------------------------------------------ */
/* Helper: unwrap the standard response envelope                       */
/* ------------------------------------------------------------------ */
function unwrap(response) {
  return response.data?.data ?? response.data;
}

/* ================================================================== */
/* 1. Auth                                                              */
/* ================================================================== */
export const authApi = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {{ user, accessToken, refreshToken }}
   */
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials).then(unwrap),

  /**
   * @param {{ firstName, lastName, email, password, role?, phoneNumber?, barNumber? }} payload
   */
  register: (payload) =>
    axiosClient.post('/auth/register', payload).then(unwrap),

  logout: () =>
    axiosClient.post('/auth/logout').then(unwrap),

  /** Uses the httpOnly cookie automatically via withCredentials */
  refreshToken: () =>
    axiosClient.post('/auth/refresh-token').then(unwrap),

  /** @returns {{ user }} */
  me: () =>
    axiosClient.get('/auth/me').then(unwrap),

  forgotPassword: (email) =>
    axiosClient.post('/auth/forgot-password', { email }).then(unwrap),

  resetPassword: (token, password) =>
    axiosClient.post(`/auth/reset-password/${token}`, { password }).then(unwrap),

  resendVerification: (email) =>
    axiosClient.post('/auth/resend-verification', { email }).then(unwrap),
};

/* ================================================================== */
/* 2. Cases                                                             */
/* ================================================================== */
export const casesApi = {
  /**
   * @param {{ page?, limit?, status?, stage?, court?, search? }} params
   */
  list: (params = {}) =>
    axiosClient.get('/cases', { params }).then(unwrap),

  /**
   * @param {{ caseNumber, title, description?, court?, stage?, status?, isProBono?, detentionDate? }} payload
   */
  create: (payload) =>
    axiosClient.post('/cases', payload).then(unwrap),

  /** @param {string} id — MongoDB _id */
  getById: (id) =>
    axiosClient.get(`/cases/${id}`).then(unwrap),

  /** @param {string} id, @param {object} updates */
  update: (id, updates) =>
    axiosClient.patch(`/cases/${id}`, updates).then(unwrap),

  /** @param {string} id */
  delete: (id) =>
    axiosClient.delete(`/cases/${id}`).then(unwrap),

  /**
   * @param {string} id
   * @param {{ stage?, status?, stallReason?, comments? }} payload
   */
  updateStatus: (id, payload) =>
    axiosClient.post(`/cases/${id}/status`, payload).then(unwrap),

  /** @param {string} id */
  auditLog: (id) =>
    axiosClient.get(`/cases/${id}/audit-log`).then(unwrap),

  /** @param {string} id — returns base64 PNG QR data URI */
  qrSlip: (id) =>
    axiosClient.get(`/cases/${id}/qr-slip`).then(unwrap),

  /**
   * @param {'csv'|'pdf'} format
   * @param {string} [caseId] — required for PDF
   */
  export: (format, caseId) =>
    axiosClient.get('/cases/export', {
      params: { format, ...(caseId ? { caseId } : {}) },
      responseType: 'blob',
    }),

  /**
   * Bulk import via CSV file.
   * @param {File} file
   */
  bulkImport: (file) => {
    const form = new FormData();
    form.append('file', file);
    return axiosClient.post('/cases/bulk-import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
  },
};

/* ================================================================== */
/* 3. Documents                                                         */
/* ================================================================== */
export const documentsApi = {
  /** @param {string} caseId */
  list: (caseId) =>
    axiosClient.get(`/cases/${caseId}/documents`).then(unwrap),

  /**
   * @param {string} caseId
   * @param {File} file
   * @param {string} [description]
   */
  upload: (caseId, file, description = '') => {
    const form = new FormData();
    form.append('file', file);
    if (description) form.append('description', description);
    return axiosClient.post(`/cases/${caseId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
  },

  /** @param {string} documentId */
  delete: (documentId) =>
    axiosClient.delete(`/documents/${documentId}`).then(unwrap),

  /**
   * Build the full URL for a document's file.
   * @param {string} fileUrl — the `fileUrl` field from a document object
   * @returns {string}
   */
  fileUrl: (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    return `https://gavel-backend-nw0p.onrender.com/uploads/${fileUrl.replace(/^\/uploads\//, '')}`;
  },
};

/* ================================================================== */
/* 4. Public (no auth required)                                         */
/* ================================================================== */
export const publicApi = {
  /** @param {string} caseHashId — e.g. GAV-26-8A3F9 */
  getCaseByHashId: (caseHashId) =>
    axiosClient.get(`/public/cases/${encodeURIComponent(caseHashId)}`).then(unwrap),

  /** @returns {{ totalCases, activeCases, resolvedCases, stalledCases, resolutionRate }} */
  scorecard: () =>
    axiosClient.get('/public/scorecard').then(unwrap),

  /** @returns {Array<{ court, activeCases, stalledCases }>} */
  backlogMap: () =>
    axiosClient.get('/public/backlog-map').then(unwrap),

  /** @returns {Array<{ period: string, filed: number, resolved: number }>} */
  trends: () =>
    axiosClient.get('/public/trends').then(unwrap),
};

/* ================================================================== */
/* 5. Watch Subscriptions                                               */
/* ================================================================== */
export const watchApi = {
  /**
   * @param {string} caseHashId
   * @param {string} email
   * @returns {{ unsubscribeToken: string }}
   */
  subscribe: (caseHashId, email) =>
    axiosClient.post(`/watch/${encodeURIComponent(caseHashId)}`, { email }).then(unwrap),

  /** @param {string} idOrToken */
  unsubscribe: (idOrToken) =>
    axiosClient.delete(`/watch/${idOrToken}`).then(unwrap),
};

/* ================================================================== */
/* 6. Pro-Bono                                                          */
/* ================================================================== */
export const proBonoApi = {
  /** @param {{ minDetentionDays?: number }} params */
  listAvailable: (params = {}) =>
    axiosClient.get('/pro-bono/cases', { params }).then(unwrap),

  /** @param {string} caseId */
  claim: (caseId) =>
    axiosClient.post(`/pro-bono/cases/${caseId}/claim`).then(unwrap),

  /** Returns all cases claimed by the current lawyer */
  myClaimed: () =>
    axiosClient.get('/pro-bono/my-claimed').then(unwrap),
};

/* ================================================================== */
/* 7. Analytics (admin only)                                            */
/* ================================================================== */
export const analyticsApi = {
  overview: () =>
    axiosClient.get('/analytics/overview').then(unwrap),

  heatmap: () =>
    axiosClient.get('/analytics/heatmap').then(unwrap),

  trends: () =>
    axiosClient.get('/analytics/trends').then(unwrap),
};

/* ================================================================== */
/* 8. User Management (admin only)                                      */
/* ================================================================== */
export const usersApi = {
  /** @param {{ role?, page?, limit? }} params */
  list: (params = {}) =>
    axiosClient.get('/users', { params }).then(unwrap),

  /**
   * @param {{ email, firstName, lastName, role, court? }} payload
   */
  invite: (payload) =>
    axiosClient.post('/users/invite', payload).then(unwrap),

  /** @param {string} id, @param {object} updates */
  update: (id, updates) =>
    axiosClient.patch(`/users/${id}`, updates).then(unwrap),

  /** @param {string} id */
  delete: (id) =>
    axiosClient.delete(`/users/${id}`).then(unwrap),
};

/* ================================================================== */
/* 9. System Health                                                     */
/* ================================================================== */
export const healthApi = {
  ping: () =>
    axiosClient.get('/health').then(unwrap),
};
