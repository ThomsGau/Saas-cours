import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from "axios";

import { API_BASE_URL, API_TIMEOUT_MS } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/token-store";

function attachErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error) && error.response) {
        throw ApiError.fromResponse(error.response.status, error.response.data);
      }

      if (isAxiosError(error) && error.code === "ECONNABORTED") {
        throw new ApiError(408, "Timeout", "La requête a expiré.");
      }

      throw error;
    },
  );
}

function attachAuthInterceptor(
  instance: AxiosInstance,
  tokenProvider: () => Promise<string | null>,
): void {
  instance.interceptors.request.use(async (config) => {
    const token = await tokenProvider();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

/**
 * Client API pour le navigateur : injecte automatiquement le JWT si disponible.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(apiClient, getAccessToken);
attachErrorInterceptor(apiClient);

/**
 * Client API pour le serveur (RSC, route handlers) avec un token explicite.
 */
export function createServerApiClient(accessToken?: string | null): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
    },
  });

  attachAuthInterceptor(instance, async () => accessToken ?? null);
  attachErrorInterceptor(instance);

  return instance;
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}
