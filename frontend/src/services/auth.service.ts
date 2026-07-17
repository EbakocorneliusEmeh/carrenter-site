import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  BecomeDealerPayload,
  ChangePasswordPayload,
  DealerProfile,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateAvatarPayload,
  UpdateProfilePayload,
} from "@/types/auth.types";
import { api, refreshClient, normalizeTokens, unwrapApiData } from "@/lib/axios";
import { clearAuthSession, getRefreshToken, setAuthSession } from "@/utils/tokenStorage";
import axios from "axios";

function normalizeUser(payload: any): AuthUser | null {
  const user =
    payload?.user ??
    payload?.data?.user ??
    payload?.account ??
    payload?.profile ??
    payload?.currentUser ??
    payload?.me ??
    payload ??
    null;

  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    id: user.id ?? user._id ?? user.userId ?? undefined,
    fullName: user.fullName ?? user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: typeof user.role === "string" ? user.role.toLowerCase() : "customer",
    businessName: user.businessName ?? null,
    avatarUrl: user.avatarUrl ?? null,
  };
}

function normalizeSession(data: any): AuthSession {
  const payload = unwrapApiData<any>(data);
  const user = normalizeUser(payload);
  const tokens = normalizeTokens(payload);

  return {
    user,
    tokens,
    message:
      payload?.message ??
      data?.message ??
      (typeof payload === "string" ? payload : undefined),
  };
}

function extractErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && !error.response) {
    return `Cannot reach the backend at ${api.defaults.baseURL}. Make sure the auth server is running and the URL is correct.`;
  }

  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: any } }).response;
    const data = response?.data;
    return (
      data?.message ??
      data?.error ??
      data?.errors?.[0]?.message ??
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getFriendlyError(error: unknown) {
  return extractErrorMessage(error);
}

export async function register(payload: RegisterPayload) {
  const response = await api.post("/api/v1/auth/register", payload);
  const session = normalizeSession(response.data);

  if (session.tokens) {
    setAuthSession(session.tokens, session.user);
  }

  return session;
}

export async function becomeDealer(payload: BecomeDealerPayload) {
  const response = await api.post("/api/v1/auth/become-dealer", payload);
  const session = normalizeSession(response.data);

  if (session.tokens) {
    setAuthSession(session.tokens, session.user);
  }

  return session;
}

export async function login(payload: LoginPayload) {
  const response = await api.post("/api/v1/auth/login", payload);
  const session = normalizeSession(response.data);

  if (!session.tokens) {
    throw new Error("Login succeeded, but no session tokens were returned.");
  }

  setAuthSession(session.tokens, session.user);
  return session;
}

export async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await refreshClient.post("/api/v1/auth/refresh", {
    refreshToken,
  });
  const tokens = normalizeTokens(response.data);

  if (!tokens) {
    return null;
  }

  // Save new tokens immediately so subsequent requests use the fresh access token
  setAuthSession(tokens, null);

  // Now fetch the real user from DB (the only reliable source of the current role)
  try {
    const freshUser = await fetchUserProfile();
    if (freshUser) {
      setAuthSession(tokens, freshUser);
      return { tokens, user: freshUser };
    }
  } catch {
    // If profile fetch fails, return just the tokens with no user
  }

  return { tokens, user: null };
}

export async function fetchMe() {
  const response = await api.get("/api/v1/user/profile");
  const payload = unwrapApiData<any>(response.data);
  return normalizeUser(payload);
}

export async function fetchUserProfile() {
  const response = await api.get("/api/v1/user/profile");
  const payload = unwrapApiData<any>(response.data);
  return normalizeUser(payload);
}

export async function fetchDealerProfile() {
  const response = await api.get("/api/v1/user/dealer-profile");
  const payload = unwrapApiData<any>(response.data);
  return payload?.dealerProfile as DealerProfile | null;
}

export async function updateDealerProfile(payload: BecomeDealerPayload) {
  const response = await api.put("/api/v1/user/dealer-profile", payload);
  const payloadData = unwrapApiData<any>(response.data);

  const user = normalizeUser(payloadData);
  if (user) {
    const tokens = normalizeTokens(payloadData);
    if (tokens) {
      setAuthSession(tokens, user);
    } else {
      setAuthSession({
        accessToken: getRefreshToken() ?? "",
        refreshToken: getRefreshToken() ?? "",
      }, user);
    }
  }

  return {
    profile: payloadData?.dealerProfile as DealerProfile | null,
    user,
  };
}

export async function logout() {
  const refreshToken = getRefreshToken();

  // If there's no refresh token we still want to clear local session state
  if (!refreshToken) {
    clearAuthSession();
    return;
  }

  try {
    await api.post("/api/v1/auth/logout", { refreshToken });
  } catch (err: unknown) {
    // Network errors or server issues during logout should not block
    // client-side session cleanup. Log a helpful message for debugging.
    if (axios.isAxiosError(err) && !err.response) {
      // Likely the auth server is down or incorrect baseURL
      // Keep behavior quiet in production but warn in dev
      // eslint-disable-next-line no-console
      console.warn(
        `Logout request failed (network): cannot reach ${api.defaults.baseURL}`,
        err,
      );
    } else {
      // eslint-disable-next-line no-console
      console.warn("Logout request failed:", err);
    }
  } finally {
    clearAuthSession();
  }
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await api.post("/api/v1/auth/forgot-password", payload);
  return normalizeSession(response.data);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await api.post("/api/v1/auth/reset-password", payload);
  return normalizeSession(response.data);
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.put("/api/v1/user/profile", payload);
  const payloadData = unwrapApiData<any>(response.data);
  const user = normalizeUser(payloadData);

  if (user) {
    const tokens = normalizeTokens(payloadData);
    if (tokens) {
      setAuthSession(tokens, user);
    } else {
      const currentRefreshToken = getRefreshToken();
      if (currentRefreshToken) {
        setAuthSession({
          accessToken: currentRefreshToken,
          refreshToken: currentRefreshToken,
        }, user);
      }
    }
  }

  return user;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.post("/api/v1/user/change-password", payload);
  const payloadData = unwrapApiData<any>(response.data);
  return payloadData?.message ?? "Password changed successfully";
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/api/v1/user/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const payloadData = unwrapApiData<any>(response.data);
  const user = normalizeUser(payloadData);

  if (user) {
    const tokens = normalizeTokens(payloadData);
    if (tokens) {
      setAuthSession(tokens, user);
    } else {
      const currentRefreshToken = getRefreshToken();
      if (currentRefreshToken) {
        setAuthSession({
          accessToken: currentRefreshToken,
          refreshToken: currentRefreshToken,
        }, user);
      }
    }
  }

  return user;
}
