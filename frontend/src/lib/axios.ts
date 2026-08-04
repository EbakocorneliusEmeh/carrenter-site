import axios from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession,
  getStoredUser,
} from "@/utils/tokenStorage";
import type { AuthTokens } from "@/types/auth.types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise: Promise<AuthTokens | null> | null = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post(
            "/api/v1/auth/refresh",
            { refreshToken },
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          )
          .then((response) => {
            const payload = response.data?.data ?? response.data ?? {};
            const nextTokens = normalizeTokens(payload);
            if (!nextTokens) {
              return null;
            }

            const currentUser = getStoredUser();
            setAuthSession(nextTokens, currentUser);
            return nextTokens;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const nextTokens = await refreshPromise;
      if (!nextTokens) {
        clearAuthSession();
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextTokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  },
);

export function normalizeTokens(payload: any): AuthTokens | null {
  const accessToken =
    payload?.tokens?.accessToken ??
    payload?.accessToken ??
    payload?.token ??
    payload?.data?.accessToken ??
    null;
  const refreshToken =
    payload?.tokens?.refreshToken ??
    payload?.refreshToken ??
    payload?.data?.refreshToken ??
    null;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export function unwrapApiData<T>(data: any): T {
  return (data?.data ?? data?.result ?? data) as T;
}

export function isAxiosCancelled(error: unknown) {
  return axios.isAxiosError(error) && error.code === "ERR_CANCELED";
}

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
