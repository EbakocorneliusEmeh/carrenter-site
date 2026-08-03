"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import styles from "./layout.module.css";

const NAV_LINKS = [
  { href: "/dealer/dashboard", label: "📊 Analytics" },
  { href: "/dealer/vehicles", label: "🚗 My Vehicles" },
  { href: "/dealer/bookings", label: "📋 Bookings" },
  { href: "/dealer/settings", label: "⚙️ Settings" },
  { href: "/customer/favorites", label: "❤️ Saved Vehicles" },
];

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarIcon}>🏢</span>
          <div>
            <div className={styles.sidebarTitle}>Dealer Portal</div>
            <div className={styles.sidebarSubtitle}>{user?.businessName || user?.fullName || "Loading..."}</div>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.backBtn}>← Public View</Link>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
