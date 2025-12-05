import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { destroyCookie, parseCookies, setCookie } from "nookies";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    permissions: string[];
    barbershop?: {
      id: string;
      name: string;
    } | null;
  };
}

const ACCESS_TOKEN_COOKIE = "devnex.accessToken";
const REFRESH_TOKEN_COOKIE = "devnex.refreshToken";
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const ensureBaseURL = () => {
  if (!baseURL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Defina-o em .env.local antes de autenticar."
    );
  }
};

const api: AxiosInstance = axios.create({
  baseURL: baseURL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

const rawClient = axios.create({ baseURL: baseURL ?? "" });

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetriableRequestConfig;
}> = [];
let logoutHandler: (() => void) | null = null;

const processQueue = (error?: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
      return;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config._retry = true;
    resolve(api(config));
  });
  failedQueue = [];
};

export const getAccessToken = () => parseCookies()[ACCESS_TOKEN_COOKIE];
export const getRefreshToken = () => parseCookies()[REFRESH_TOKEN_COOKIE];

export const persistTokens = (
  tokens: AuthTokens,
  maxAgeSeconds = 60 * 60 * 24 * 7
) => {
  setCookie(undefined, ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: maxAgeSeconds,
  });
  setCookie(undefined, REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: maxAgeSeconds,
  });
};

export const clearTokens = () => {
  destroyCookie(undefined, ACCESS_TOKEN_COOKIE, { path: "/" });
  destroyCookie(undefined, REFRESH_TOKEN_COOKIE, { path: "/" });
};

export const registerLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
  return () => {
    if (logoutHandler === handler) {
      logoutHandler = null;
    }
  };
};

const attemptRefresh = async () => {
  ensureBaseURL();
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await rawClient.post<AuthResponse>("/auth/refresh", null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  persistTokens(response.data);
  return response.data;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await attemptRefresh();
        processQueue(undefined, refreshed.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        logoutHandler?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      clearTokens();
      logoutHandler?.();
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;

export const authRequests = {
  async login(credentials: { email: string; password: string }) {
    ensureBaseURL();
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    persistTokens(response.data);
    return response.data;
  },
  async refresh() {
    return attemptRefresh();
  },
};

export type { AuthResponse as AuthSession };

export type ApiClient = typeof apiClient;

export type ApiRequestConfig = AxiosRequestConfig;
