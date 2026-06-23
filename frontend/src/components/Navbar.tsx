"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardPath, getRoleLabel } from "@/utils/roleRedirect";

const authLinks = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Create account" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const dashboardHref = user ? getDashboardPath(user.role) : "/login";

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          CarRent
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={pathname === "/" ? styles.active : ""} href="/">
            Home
          </Link>
          <Link
            className={pathname === "/profile" ? styles.active : ""}
            href="/profile"
          >
            Profile
          </Link>
          {isAuthenticated ? (
            <>
              <Link className={styles.dashboardLink} href={dashboardHref}>
                {getRoleLabel(user?.role)} dashboard
              </Link>
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={isLoading}
              >
                Logout
              </button>
            </>
          ) : (
            <div className={styles.authLinks}>
              {authLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
