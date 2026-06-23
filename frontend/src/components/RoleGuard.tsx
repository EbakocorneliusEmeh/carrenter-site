"use client";

import ProtectedRoute from "./ProtectedRoute";
import type { UserRole } from "@/types/auth.types";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  return <ProtectedRoute roles={allowedRoles}>{children}</ProtectedRoute>;
}
