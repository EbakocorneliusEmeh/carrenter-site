"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth.types";
import { getDashboardPath } from "@/utils/roleRedirect";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (roles?.length && user && !roles.includes(user.role)) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isAuthenticated, isLoading, roles, router, user]);

  if (isLoading || !isAuthenticated) {
    return <Loader fullScreen label="Checking session..." />;
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Loader fullScreen label="Redirecting..." />;
  }

  return <>{children}</>;
}
