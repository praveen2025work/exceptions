import { useLoading } from '@/contexts/LoadingContext';
import { useUser } from '@/contexts/UserContext';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiService {
  private baseUrl: string;
  private setLoading?: (loading: boolean, message?: string) => void;
  private userName?: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  setLoadingHandler(setLoading: (loading: boolean, message?: string) => void) {
    this.setLoading = setLoading;
  }

  setUserName(userName: string) {
    this.userName = userName;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    loadingMessage?: string
  ): Promise<ApiResponse<T>> {
    try {
      if (this.setLoading && loadingMessage) {
        this.setLoading(true, loadingMessage);
      }

      const url = `${this.baseUrl}${endpoint}`;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(this.userName && { 'X-User-Name': this.userName }),
      };

      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false,
      };
    } finally {
      if (this.setLoading) {
        this.setLoading(false);
      }
    }
  }

  async get<T>(endpoint: string, loadingMessage?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' }, loadingMessage);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    loadingMessage?: string
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      loadingMessage
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    loadingMessage?: string
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      loadingMessage
    );
  }

  async delete<T>(endpoint: string, loadingMessage?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' }, loadingMessage);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    loadingMessage?: string
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      loadingMessage
    );
  }
}

// Hook to create an API service instance with loading and user context
export const useApiService = () => {
  const { setLoading } = useLoading();
  const { user } = useUser();

  const apiService = new ApiService();
  apiService.setLoadingHandler(setLoading);
  
  if (user?.userName) {
    apiService.setUserName(user.userName);
  }

  return apiService;
};

// Singleton instance for use outside of React components
export const apiService = new ApiService();