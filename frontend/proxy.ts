import { NextRequest, NextResponse } from "next/server";

// Inline type to keep middleware fully self-contained on the Edge Runtime.
// Do NOT import from other project files here — even type-only imports can
// pull transitive dependencies that break the Edge bundler.
type UserRole = "customer" | "dealer" | "admin";

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_PREFIXES = [
  "/profile",
  "/dashboard",
  "/customer",
  "/dealer",
  "/admin",
];

function getDashboardPath(_role?: UserRole | null) {
  // All roles land on the same smart general dashboard
  return "/dashboard";
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get("carrent_access_token")?.value;
  const role = request.cookies.get("carrent_role")?.value as UserRole | undefined;

  const isAuthenticated = Boolean(accessToken);
  const isAuthRoute = matchesPrefix(pathname, AUTH_ROUTE_PREFIXES);
  const isProtectedRoute = matchesPrefix(pathname, PROTECTED_PREFIXES);

  // Handle legacy/unprefixed `/dashboard` path by redirecting to login if unauthenticated.
  if (pathname === "/dashboard") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    // If authenticated and on /dashboard, do nothing, just let them in.
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(
      new URL(getDashboardPath(role), request.url),
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  const lowerRole = role?.toLowerCase();

  if (
    isProtectedRoute &&
    lowerRole &&
    pathname.startsWith("/customer") &&
    lowerRole !== "customer"
  ) {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (isProtectedRoute && pathname.startsWith("/dealer") && lowerRole !== "dealer") {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (isProtectedRoute && pathname.startsWith("/admin") && lowerRole !== "admin") {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
  ],
};

