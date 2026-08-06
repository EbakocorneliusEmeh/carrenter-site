"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Navbar.module.css";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      router.replace("/login");
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={closeMenu}>
          DRIVENOW
        </Link>

        {/* Hamburger button — visible only on mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barTop : ""}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barMid : ""}`} />
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.barBot : ""}`} />
        </button>

        {/* Nav — collapses on mobile */}
        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
          aria-label="Primary"
        >
          <Link
            className={pathname === "/" ? styles.active : ""}
            href="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <div className={styles.authLinks}>
              <NotificationBell />
              <Link
                className={pathname === "/profile" ? styles.active : ""}
                href="/profile"
                onClick={closeMenu}
              >
                Profile
              </Link>
              <Link
                className={styles.solidButton}
                href="/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className={styles.outlineButton}
                onClick={() => { handleLogout(); closeMenu(); }}
                disabled={isLoading}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link className={styles.outlineButton} href="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link className={styles.solidButton} href="/register" onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />
      )}
    </header>
  );
}
