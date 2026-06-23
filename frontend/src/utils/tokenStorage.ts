import type { AuthTokens, AuthUser } from "@/types/auth.types";

const ACCESS_TOKEN_KEY = "carrent_access_token";
const REFRESH_TOKEN_KEY = "carrent_refresh_token";
const USER_KEY = "carrent_user";
const ROLE_KEY = "carrent_role";
const MAX_AGE = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string) {
  if (!isBrowser()) {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setAuthSession(tokens: AuthTokens, user: AuthUser | null) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  window.localStorage.setItem(ROLE_KEY, user?.role ?? "");

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }

  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken);
  setCookie(ROLE_KEY, user?.role ?? "");
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ROLE_KEY);

  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  deleteCookie(ROLE_KEY);
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredRole() {
  if (!isBrowser()) {
    return null;
  }

  return (window.localStorage.getItem(ROLE_KEY) || null) as
    | AuthUser["role"]
    | null;
}

export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function hasStoredSession() {
  return Boolean(getAccessToken() || getRefreshToken());
}
