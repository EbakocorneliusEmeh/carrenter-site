import type { UserRole } from "@/types/auth.types";

export function getDashboardPath(role: UserRole | null | undefined) {
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

export function getRoleLabel(role: UserRole | null | undefined) {
  switch (role) {
    case "customer":
      return "Customer";
    case "dealer":
      return "Dealer";
    case "admin":
      return "Admin";
    default:
      return "Guest";
  }
}
