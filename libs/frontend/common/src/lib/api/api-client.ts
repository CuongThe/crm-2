import Cookies from 'js-cookie';
import { RequestOptions } from './types';

export class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof process !== 'undefined' &&
        (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL)) ||
      'http://localhost:3000/api';
  }

  private getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  }

  private getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  }

  private setAccessToken(token: string) {
    Cookies.set('accessToken', token, { path: '/' });
  }

  private clearAuthCookies() {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('accessToken');
    Cookies.remove('session_token', { path: '/' });
    Cookies.remove('session_token');
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('refreshToken');
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string | null) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async handleRefreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthCookies();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Refresh token failed');
      }

      const data = await res.json();
      const newAccessToken = data.accessToken || data.data?.accessToken;
      if (newAccessToken) {
        this.setAccessToken(newAccessToken);
        return newAccessToken;
      }
      throw new Error('No access token in response');
    } catch (err) {
      this.clearAuthCookies();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
    let fullUrl = isAbsolute
      ? path
      : `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    return fullUrl;
  }

  private getDefaultHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!options?.skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const lang = localStorage.getItem('i18nextLng');
      if (lang) {
        headers['Accept-Language'] = lang;
      }
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        headers['x-organization-id'] = orgId;
      }
      const branchId = localStorage.getItem('currentBranchId');
      if (branchId) {
        headers['x-branch-id'] = branchId;
      }
    }

    return headers;
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      showToastOnError = true,
      silentErrors = false,
      skipAuth = false,
      retryCount = 0,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(path, params);
    const defaultHeaders = this.getDefaultHeaders(options);
    const mergedHeaders = {
      ...defaultHeaders,
      ...(customHeaders as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: mergedHeaders,
      });

      // Xử lý 401: Unauthorized -> Refresh Token
      if (response.status === 401 && !skipAuth) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.handleRefreshToken();
          this.isRefreshing = false;
          this.onTokenRefreshed(newToken);

          if (newToken) {
            return this.request<T>(path, { ...options, retryCount: retryCount + 1 });
          }
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }

        // Nếu đang trong quá trình refresh, đợi token mới
        return new Promise<T>((resolve, reject) => {
          this.addRefreshSubscriber((token) => {
            if (token) {
              resolve(this.request<T>(path, { ...options, retryCount: retryCount + 1 }));
            } else {
              reject(new Error('Phiên đăng nhập đã hết hạn.'));
            }
          });
        });
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage =
            errData.message ||
            (Array.isArray(errData.message) ? errData.message.join(', ') : errData.error) ||
            errorMessage;
        } catch {
          // ignore json parse error
        }

        if (!silentErrors && showToastOnError && typeof window !== 'undefined') {
          console.error(`[API Error] ${errorMessage}`);
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return { success: true } as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error: any) {
      if (retryCount > 0 && retryCount < 2) {
        return this.request<T>(path, { ...options, retryCount: retryCount + 1 });
      }
      throw error;
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
