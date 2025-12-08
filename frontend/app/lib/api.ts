/**
 * ==============================================
 * VARLIXO - API CLIENT
 * ==============================================
 * Axios instance with interceptors for API calls.
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// API Base URL - Uses environment variable in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout to prevent hanging requests
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          Cookies.set('accessToken', accessToken, { expires: 7 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 30 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (code: string) => api.post('/auth/2fa/enable', { code }),
  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code }),
};

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getSummary: () => api.get('/wallet/summary'),
  createDeposit: (data: any) => api.post('/wallet/deposit', data),
  getDeposits: (params?: any) => api.get('/wallet/deposits', { params }),
  uploadDepositProof: (data: FormData) => api.post('/wallet/deposit/proof', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createWithdrawal: (data: any) => api.post('/wallet/withdrawal', data),
  getWithdrawals: (params?: any) => api.get('/wallet/withdrawals', { params }),
  cancelWithdrawal: (id: string) => api.delete(`/wallet/withdrawal/${id}`),
  getTransactions: (params?: any) => api.get('/wallet/transactions', { params }),
};

export const investmentAPI = {
  getPlans: () => api.get('/investments/plans'),
  getPlanBySlug: (slug: string) => api.get(`/investments/plans/${slug}`),
  calculateReturns: (data: any) => api.post('/investments/calculate', data),
  createInvestment: (data: any) => api.post('/investments', data),
  getMyInvestments: (params?: any) => api.get('/investments/my', { params }),
  getSummary: () => api.get('/investments/summary'),
  getInvestment: (id: string) => api.get(`/investments/${id}`),
};

export const kycAPI = {
  getStatus: () => api.get('/kyc/status'),
  submit: (data: FormData) => api.post('/kyc/submit', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const referralAPI = {
  getStats: () => api.get('/referrals/stats'),
  getReferrals: (params?: any) => api.get('/referrals', { params }),
  getEarnings: (params?: any) => api.get('/referrals/earnings', { params }),
  validateCode: (code: string) => api.get(`/referrals/validate/${code}`),
};

export const marketAPI = {
  getCryptos: (limit?: number) => api.get('/market/cryptos', { params: { limit } }),
  getCrypto: (id: string) => api.get(`/market/cryptos/${id}`),
  getGlobal: () => api.get('/market/global'),
  getTrending: () => api.get('/market/trending'),
  getHistory: (id: string, days?: number) => api.get(`/market/history/${id}`, { params: { days } }),
  convert: (from: string, to: string, amount: number) =>
    api.get('/market/convert', { params: { from, to, amount } }),
  getLiveCryptoPrices: (ids: string, currencies: string) =>
    axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  adjustUserBalance: (id: string, data: any) => api.post(`/admin/users/${id}/balance`, data),
  verifyUserKyc: (id: string) => api.post(`/admin/users/${id}/verify-kyc`),
  sendUserEmail: (id: string, data: any) => api.post(`/admin/users/${id}/email`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getDeposits: (params?: any) => api.get('/admin/deposits', { params }),
  approveDeposit: (id: string, data?: any) => api.post(`/admin/deposits/${id}/approve`, data),
  rejectDeposit: (id: string, data: any) => api.post(`/admin/deposits/${id}/reject`, data),
  getWithdrawals: (params?: any) => api.get('/admin/withdrawals', { params }),
  approveWithdrawal: (id: string, data?: any) => api.post(`/admin/withdrawals/${id}/approve`, data),
  rejectWithdrawal: (id: string, data: any) => api.post(`/admin/withdrawals/${id}/reject`, data),
  // KYC admin routes live under /kyc/admin on the backend
  getPendingKyc: (params?: any) => api.get('/kyc/admin/pending', { params }),
  approveKyc: (id: string, data?: any) => api.post(`/admin/kyc/${id}/approve`, data),
  rejectKyc: (id: string, data: any) => api.post(`/admin/kyc/${id}/reject`, data),
  getPlans: (params?: any) => api.get('/admin/plans', { params }),
  createPlan: (data: any) => api.post('/admin/plans', data),
  updatePlan: (id: string, data: any) => api.put(`/admin/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),
  getLogs: (params?: any) => api.get('/admin/logs', { params }),
  getStats: () => api.get('/admin/stats'),
  clearTestData: () => api.post('/admin/clear-test-data'),
};

export default api;


