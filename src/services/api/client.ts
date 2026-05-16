// HTTP Client for API calls
import { API_CONFIG } from "../config";
import { markBackendOffline, markBackendOnline } from "../backendHealth";
import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
};

class ApiClient {
  private token: string | null = null;

  private redirectToLogin(
    reason: "unauthorized" | "suspicious" = "unauthorized",
  ) {
    if (typeof window === "undefined") {
      return;
    }

    const currentPath = window.location.pathname;
    if (currentPath === "/login") {
      return;
    }

    window.location.assign(`/login?reason=${reason}`);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const { timeoutMs, ...requestOptions } = options;

    const config: RequestInit = {
      ...requestOptions,
      headers: {
        ...this.getHeaders(),
        ...requestOptions.headers,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeoutMs ?? API_CONFIG.TIMEOUT,
    );

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      if (response.status === 503) {
        markBackendOffline("Service unavailable");
        toast.error("Service unavailable", { id: "backend-error" });
      }

      if (response.status === 401 || response.status === 403) {
        this.setToken(null);
        this.redirectToLogin(
          response.status === 403 ? "suspicious" : "unauthorized",
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData,
        );
      }

      markBackendOnline();

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          markBackendOffline("Request timeout");
          toast.error("Request timeout", { id: "backend-error" });
          throw new ApiError("Request timeout", 408);
        }
        markBackendOffline(error.message || "Backend unavailable");
        toast.error(error.message || "Backend unavailable", {
          id: "backend-error",
        });
        throw new ApiError(error.message, 0);
      }

      markBackendOffline("Unknown backend connectivity error");
      toast.error("Unknown backend connectivity error", {
        id: "backend-error",
      });
      throw new ApiError("Unknown error occurred", 0);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
