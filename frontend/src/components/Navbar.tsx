"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  const authLinks = [
    { href: "/login", label: "Login" },
    { href: "/register", label: "Create account" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      // Ensure logout errors do not produce unhandled rejections.
      // Show a friendly warning and continue to redirect to login.
      // eslint-disable-next-line no-console
      console.warn("Logout failed:", err);
    } finally {
      router.replace("/login");
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          DRIVENOW
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link className={pathname === "/" ? styles.active : ""} href="/">
            Home
          </Link>

          {isAuthenticated ? (
            <div className={styles.authLinks}>
              <NotificationBell />
              <Link 
                className={pathname === "/profile" ? styles.active : ""} 
                href="/profile"
              >
                Profile
              </Link>
              <Link 
                className={styles.solidButton} 
                href="/dashboard"
              >
                Dashboard
              </Link>
              <button
                type="button"
                className={styles.outlineButton}
                onClick={handleLogout}
                disabled={isLoading}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link className={styles.outlineButton} href="/login">
                Login
              </Link>
              <Link className={styles.solidButton} href="/register">
                Sign in
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
