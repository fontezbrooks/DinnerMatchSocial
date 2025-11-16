// API Client for DinnerMatch Backend
import * as SecureStore from 'expo-secure-store';

import { ENV } from '@/utils/env';
import { ApiResponse } from '@/types';

// Token management
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'dinnermatch_access_token',
  REFRESH_TOKEN: 'dinnermatch_refresh_token',
  TOKEN_EXPIRES_AT: 'dinnermatch_token_expires_at',
} as const;

export class TokenManager {
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  static async setTokens(accessToken: string, refreshToken: string, expiresAt: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt),
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_EXPIRES_AT),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  static async isTokenExpired(): Promise<boolean> {
    try {
      const expiresAt = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_EXPIRES_AT);
      if (!expiresAt) return true;

      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

// API Client class
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = ENV.API_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const accessToken = await TokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    return headers;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    const isExpired = await TokenManager.isTokenExpired();

    if (isExpired) {
      const refreshToken = await TokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await this.post<{
            accessToken: string;
            refreshToken: string;
            expiresAt: string;
          }>('/auth/refresh', { refreshToken }, false);

          if (response.success && response.data) {
            await TokenManager.setTokens(
              response.data.accessToken,
              response.data.refreshToken,
              response.data.expiresAt
            );
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          await TokenManager.clearTokens();
          throw new Error('Session expired. Please sign in again.');
        }
      }
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      if (includeAuth) {
        await this.refreshTokenIfNeeded();
      }

      const headers = await this.getHeaders(includeAuth);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || responseData.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: responseData,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// API endpoint helpers
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },

  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    updateDietaryRestrictions: '/users/dietary-restrictions',
    updateEnergyLevel: '/users/energy-level',
  },

  // Groups
  groups: {
    list: '/groups',
    create: '/groups',
    detail: (id: string) => `/groups/${id}`,
    join: (code: string) => `/groups/join/${code}`,
    leave: (id: string) => `/groups/${id}/leave`,
    members: (id: string) => `/groups/${id}/members`,
  },

  // Sessions
  sessions: {
    list: '/sessions',
    create: '/sessions',
    detail: (id: string) => `/sessions/${id}`,
    update: (id: string) => `/sessions/${id}`,
    delete: (id: string) => `/sessions/${id}`,
    vote: (id: string) => `/sessions/${id}/vote`,
    confirm: (id: string) => `/sessions/${id}/confirm`,
  },

  // Restaurants
  restaurants: {
    search: '/restaurants/search',
    suggestions: (sessionId: string) => `/sessions/${sessionId}/restaurant-suggestions`,
    details: (id: string) => `/restaurants/${id}`,
  },
} as const;