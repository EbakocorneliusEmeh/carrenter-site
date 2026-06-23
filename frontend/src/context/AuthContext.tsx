"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";
import {
  fetchMe,
  forgotPassword as forgotPasswordRequest,
  getFriendlyError,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  refreshSession as refreshSessionRequest,
  resetPassword as resetPasswordRequest,
} from "@/services/auth.service";
import {
  clearAuthSession,
  getStoredUser,
  hasStoredSession,
  setAuthSession,
} from "@/utils/tokenStorage";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<AuthSession>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<AuthSession>;
  refreshSession: () => Promise<AuthSession | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const storedUser = getStoredUser();
      const hasSession = hasStoredSession();

      if (storedUser) {
        setUser(storedUser);
      }

      if (!hasSession) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await fetchMe();
        if (isMounted) {
          setUser(currentUser);
          setAuthError(null);
        }
      } catch (error) {
        const message = getFriendlyError(error);
        if (isMounted) {
          setAuthError(message);
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function saveSession(session: AuthSession) {
      if (session.tokens) {
        setAuthSession(session.tokens, session.user);
      }
      setUser(session.user);
      setAuthError(null);
      return session;
    }

    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authError,
      clearError() {
        setAuthError(null);
      },
      async login(payload: LoginPayload) {
        const session = await loginRequest(payload);
        return saveSession(session);
      },
      async register(payload: RegisterPayload) {
        const session = await registerRequest(payload);
        return saveSession(session);
      },
      async logout() {
        await logoutRequest();
        clearAuthSession();
        setUser(null);
        setAuthError(null);
      },
      async forgotPassword(payload: ForgotPasswordPayload) {
        const session = await forgotPasswordRequest(payload);
        setAuthError(null);
        return session;
      },
      async resetPassword(payload: ResetPasswordPayload) {
        const session = await resetPasswordRequest(payload);
        setAuthError(null);
        return session;
      },
      async refreshSession() {
        const session = await refreshSessionRequest();
        if (session?.user) {
          setUser(session.user);
        }
        return session;
      },
    };
  }, [authError, isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

export { AuthContext };
