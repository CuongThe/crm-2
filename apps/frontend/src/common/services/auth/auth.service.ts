import Cookies from 'js-cookie';
import { ApiClient, apiClient, RequestOptions } from '@frontend/common';
import { AuthUser, LoginDto, LoginResponse, RegisterDto } from './types';

export class AuthService {
  private client: ApiClient;
  private basePath = '/auth';

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  public async login(
    dto: LoginDto,
    options?: RequestOptions,
  ): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>(
      `${this.basePath}/login`,
      dto,
      { ...options, skipAuth: true },
    );

    if (res.accessToken) {
      Cookies.set('accessToken', res.accessToken, { path: '/' });
      if (res.refreshToken) {
        Cookies.set('refreshToken', res.refreshToken, { path: '/' });
      }
    }

    return res;
  }

  public async register(
    dto: RegisterDto,
    options?: RequestOptions,
  ): Promise<any> {
    return this.client.post(`${this.basePath}/register`, dto, {
      ...options,
      skipAuth: true,
    });
  }

  public async getMe(options?: RequestOptions): Promise<AuthUser> {
    return this.client.get<AuthUser>(`${this.basePath}/me`, options);
  }

  public logout(): void {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('accessToken');
    Cookies.remove('session_token', { path: '/' });
    Cookies.remove('session_token');
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('refreshToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const authService = new AuthService();
