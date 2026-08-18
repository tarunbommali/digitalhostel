import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const rawAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Injects Authoritative JWT
rawAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Error Interceptor: Emits Structured ApiError and Handles Tenant-Aware Session Expiry
rawAxios.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError<{ success: boolean; message: string; error?: { code: string; details: unknown } }>) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const code = error.response?.data?.error?.code;
    const details = error.response?.data?.error?.details;

    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRoute =
          currentPath === '/auth' ||
          currentPath.includes('/login') ||
          currentPath.includes('/signup') ||
          currentPath.includes('/forgot-password') ||
          currentPath.includes('/reset-password');

        if (!isAuthRoute) {
          if (currentPath.startsWith('/super-admin')) {
            window.location.href = '/super-admin/login?session_expired=true';
          } else {
            const orgMatch = currentPath.match(/^\/organization\/([^\/]+)/);
            if (orgMatch && orgMatch[1]) {
              window.location.href = `/organization/${orgMatch[1]}/login?session_expired=true`;
            } else {
              window.location.href = '/auth?session_expired=true';
            }
          }
        }
      }
    }

    return Promise.reject(new ApiError(message, status, code, details));
  }
);

export interface ApiOptions extends AxiosRequestConfig {
  noAuth?: boolean;
}

/**
 * Single Canonical API Client for Campus Stay
 * Automatically unwraps standard ApiResponse<T> payloads while preserving direct responses.
 */
export const api = {
  get: async <T>(url: string, options?: ApiOptions): Promise<T> => {
    const headers = {
      ...(options?.headers || {}),
      ...(options?.noAuth ? { Authorization: '' } : {}),
    };
    const res = await rawAxios.get<ApiResponse<T> | T>(url, { ...options, headers });
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  },

  post: async <T>(url: string, body?: any, options?: ApiOptions): Promise<T> => {
    const headers = {
      ...(options?.headers || {}),
      ...(options?.noAuth ? { Authorization: '' } : {}),
    };
    const res = await rawAxios.post<ApiResponse<T> | T>(url, body, { ...options, headers });
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  },

  put: async <T>(url: string, body?: any, options?: ApiOptions): Promise<T> => {
    const headers = {
      ...(options?.headers || {}),
      ...(options?.noAuth ? { Authorization: '' } : {}),
    };
    const res = await rawAxios.put<ApiResponse<T> | T>(url, body, { ...options, headers });
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  },

  patch: async <T>(url: string, body?: any, options?: ApiOptions): Promise<T> => {
    const headers = {
      ...(options?.headers || {}),
      ...(options?.noAuth ? { Authorization: '' } : {}),
    };
    const res = await rawAxios.patch<ApiResponse<T> | T>(url, body, { ...options, headers });
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  },

  delete: async <T>(url: string, options?: ApiOptions): Promise<T> => {
    const headers = {
      ...(options?.headers || {}),
      ...(options?.noAuth ? { Authorization: '' } : {}),
    };
    const res = await rawAxios.delete<ApiResponse<T> | T>(url, { ...options, headers });
    const data = res.data;
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  },
};

export default api;
