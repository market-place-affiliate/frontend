// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Token management using cookies instead of localStorage
const TOKEN_KEY = 'auth_token';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

export interface MarketplaceCredentialRequest {
  platform: 'shopee' | 'lazada';
  app_key?: string;
  sign_method?: string;
  user_token?: string;
  app_id?: string;
  app_secret?: string;
}

export interface Product {
  id: string;
  title: string;
  image_url: string;
}

export interface Offer {
  id: string;
  product_id: string;
  marketplace: string;
  store_name: string;
  price: number;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  source_url: string;
  marketplace: 'shopee' | 'lazada';
}

export interface CreateCampaignRequest {
  name: string;
  utm_campaign: string;
  start_at: string;
  end_at: string;
}

export interface CampaignData {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
}

export interface AuthResponse {
  token?: string;
  user?: UserData;
}

// Backend response type where data is JWT token string
export interface BackendAuthResponse {
  success: boolean;
  code: number;
  message: string;
  txn_id: string;
  data: string; // JWT token
}

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Build headers object
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = getCookie(TOKEN_KEY);
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies in requests
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<string>> {
    return this.request<string>('/api/v1/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<string>> {
    return this.request<string>('/api/v1/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/v1/user/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<UserData>> {
    return this.request<UserData>('/api/v1/user/me', {
      method: 'GET',
    });
  }

  async checkMarketCredential(platform: 'shopee' | 'lazada'): Promise<ApiResponse<{ code: number }>> {
    return this.request<{ code: number }>(`/api/v1/user/market-credential/${platform}`, {
      method: 'GET',
    });
  }

  async saveMarketCredential(data: MarketplaceCredentialRequest): Promise<ApiResponse> {
    return this.request('/api/v1/user/market-credential', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>('/api/v1/product', {
      method: 'GET',
    });
  }

  async getProductOffers(productId: string): Promise<ApiResponse<Offer[]>> {
    return this.request<Offer[]>(`/api/v1/product/${productId}/offer`, {
      method: 'GET',
    });
  }

  async createProduct(data: CreateProductRequest): Promise<ApiResponse> {
    return this.request('/api/v1/product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/product/${productId}`, {
      method: 'DELETE',
    });
  }

  async createCampaign(data: CreateCampaignRequest): Promise<ApiResponse<CampaignData>> {
    return this.request('/api/v1/campaign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCampaigns(): Promise<ApiResponse> {
    return this.request('/api/v1/campaign', {
      method: 'GET',
    });
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/campaign/${campaignId}`, {
      method: 'DELETE',
    });
  }

  async getCampaignLinks(campaignId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/link/campaign/${campaignId}`, {
      method: 'GET',
    });
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // Generic POST request
  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Generic PUT request
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL);

// Helper functions for auth using cookies
export const saveAuthToken = (token: string) => {
  setCookie(TOKEN_KEY, token, 7); // Token expires in 7 days
};

export const getAuthToken = (): string | null => {
  return getCookie(TOKEN_KEY);
};

export const removeAuthToken = () => {
  deleteCookie(TOKEN_KEY);
};

export const clearAuth = () => {
  removeAuthToken();
};

// Check if user is authenticated by checking token
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
