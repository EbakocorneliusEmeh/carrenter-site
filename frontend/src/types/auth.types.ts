export type UserRole = "customer" | "dealer" | "admin";

export interface AuthUser {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  businessName?: string | null;
  avatarUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  message?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: Exclude<UserRole, "admin">;
  businessName?: string;
}

export interface DealerProfile {
  businessName: string;
}

export interface UserProfile extends AuthUser {
  dealerProfile?: DealerProfile | null;
}

export interface BecomeDealerPayload {
  businessName: string;
}

export type DealerPageStatus = "active" | "inactive" | "draft";

export interface DealerPage {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string | null;
  status: DealerPageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealerPagePayload {
  businessName: string;
  slug: string;
  description?: string;
  pagePassword?: string;
  status?: DealerPageStatus;
}

export interface UpdateDealerPagePayload {
  businessName: string;
  slug: string;
  description?: string;
  pagePassword?: string;
  status?: DealerPageStatus;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
