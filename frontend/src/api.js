const API_BASE = '/api/v1';

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('vk_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  adminLogin: (creds) => fetchApi('/auth/admin-login', { method: 'POST', body: JSON.stringify(creds) }),
  workerLogin: (creds) => fetchApi('/auth/worker-login', { method: 'POST', body: JSON.stringify(creds) }),

  // Dashboard
  getMetrics: () => fetchApi('/dashboard/metrics'),
  getRecentActivity: () => fetchApi('/dashboard/recent-activity'),

  // Workers
  getWorkers: (params = '') => fetchApi(`/workers${params}`),
  createWorker: (data) => fetchApi('/workers', { method: 'POST', body: JSON.stringify(data) }),
  updateWorker: (id, data) => fetchApi(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorker: (id) => fetchApi(`/workers/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendanceByDate: (date, params = '') => fetchApi(`/attendance/by-date?date=${date}${params}`),
  saveDailyAttendance: (date, records) => fetchApi('/attendance/save-daily', { method: 'POST', body: JSON.stringify({ date, records }) }),
  getWorkerAttendanceHistory: (workerId, month) => fetchApi(`/attendance/worker-history?workerId=${workerId}&month=${month}`),

  // Advances
  getAdvances: (params = '') => fetchApi(`/advances${params}`),
  recordAdvance: (data) => fetchApi('/advances', { method: 'POST', body: JSON.stringify(data) }),
  updateAdvance: (id, data) => fetchApi(`/advances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdvance: (id) => fetchApi(`/advances/${id}`, { method: 'DELETE' }),

  // Loans
  getLoans: (params = '') => fetchApi(`/loans${params}`),
  createLoan: (data) => fetchApi('/loans', { method: 'POST', body: JSON.stringify(data) }),
  repayLoan: (id, data) => fetchApi(`/loans/${id}/repay`, { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getMonthlyLedger: (month) => fetchApi(`/reports/monthly-ledger?month=${month}`),

  // Notifications
  getNotifications: () => fetchApi('/notifications'),
  markNotificationRead: (id) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchApi('/notifications/mark-all-read', { method: 'PUT' }),
  checkAttendanceReminder: () => fetchApi('/notifications/check-attendance-reminder', { method: 'POST' }),

  // Labour Portal
  getLabourSummary: (month = '') => fetchApi(`/labour/my-summary${month ? `?month=${month}` : ''}`),

  // Settings
  getSettings: () => fetchApi('/settings'),
  updateSettings: (settings) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify({ settings }) })
};
