import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types/auth.types";

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_PREFIXES = [
  "/profile",
  "/customer",
  "/dealer",
  "/admin",
];

function getDashboardPath(role: UserRole | undefined | null) {
  switch (role) {
    case "customer":
      return "/customer/dashboard";
    case "dealer":
      return "/dealer/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/profile";
  }
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get("carrent_access_token")?.value;
  const role = request.cookies.get("carrent_role")?.value as UserRole | undefined;

  const isAuthenticated = Boolean(accessToken);
  const isAuthRoute = matchesPrefix(pathname, AUTH_ROUTE_PREFIXES);
  const isProtectedRoute = matchesPrefix(pathname, PROTECTED_PREFIXES);

  // Allow `/dashboard` to be a unified landing page for authenticated users.
  // If unauthenticated, redirect to login preserving `next` param.
  if (pathname === "/dashboard") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (isAuthRoute && isAuthenticated) {
    // If an authenticated user visits auth routes, send them to the
    // unified main dashboard where they can choose next steps.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (
    isProtectedRoute &&
    role &&
    pathname.startsWith("/customer") &&
    role !== "customer"
  ) {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (isProtectedRoute && pathname.startsWith("/dealer") && role !== "dealer") {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (isProtectedRoute && pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
  ],
};
