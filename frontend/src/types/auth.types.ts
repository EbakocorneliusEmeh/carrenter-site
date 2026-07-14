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

export type DealerPageStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "DRAFT";

export interface DealerPage {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string | null;
  status: DealerPageStatus;
  businessType?: string | null;
  ownerName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  businessAddress?: string | null;
  cityRegion?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealerPagePayload {
  businessName: string;
  slug: string;
  description?: string;
  pagePassword?: string;
  status?: DealerPageStatus;
  businessType?: string;
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  businessAddress?: string;
  cityRegion?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface UpdateDealerPagePayload {
  businessName?: string;
  slug?: string;
  description?: string;
  pagePassword?: string;
  status?: DealerPageStatus;
  businessType?: string;
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  businessAddress?: string;
  cityRegion?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
