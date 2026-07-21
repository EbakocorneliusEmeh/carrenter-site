"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { becomeDealer, getFriendlyError } from "@/services/auth.service";
import styles from "./page.module.css";

type ActiveSection = "overview" | "profile" | "account" | "business";
const VALID_SECTIONS: ActiveSection[] = ["overview", "profile", "account", "business"];

/** Inner component that safely uses useSearchParams (must be inside Suspense) */
function CustomerDashboardInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const sectionParam = searchParams.get("section") as ActiveSection | null;
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    sectionParam && VALID_SECTIONS.includes(sectionParam) ? sectionParam : "overview"
  );

  const [businessName, setBusinessName] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionParam && VALID_SECTIONS.includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    try {
      setIsUpgrading(true);
      setUpgradeError(null);
      await becomeDealer({ businessName });
      window.location.href = "/dealer/dashboard";
    } catch (err: any) {
      setUpgradeError(getFriendlyError(err));
      setIsUpgrading(false);
    }
  };

  const navItems: { key: ActiveSection; label: string; icon: string }[] = [
    { key: "overview",  label: "Overview",                icon: "🏠" },
    { key: "profile",   label: "Update Profile",          icon: "👤" },
    { key: "account",   label: "Account Settings",        icon: "⚙️" },
    { key: "business",  label: "Become a Business Owner", icon: "🚀" },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarWrapper}>
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || "Profile"}
                width={52}
                height={52}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatar}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <h1 className={styles.welcomeText}>
              Welcome back, <span>{user?.fullName || "Guest"}</span>
            </h1>
            <p className={styles.welcomeSub}>{user?.phone || user?.email}</p>
          </div>
        </div>
        <div className={styles.roleBadge}>Customer</div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`${styles.navItem} ${activeSection === item.key ? styles.navItemActive : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {activeSection === item.key && <span className={styles.navArrow}>›</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.mainPanel}>
          {activeSection === "overview" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
              <p className={styles.sectionSub}>Here&apos;s a summary of your activity on CarRenter.</p>
              <div className={styles.statsGrid}>
                {[
                  { icon: "🚗", value: "0", label: "Active Rentals" },
                  { icon: "📋", value: "0", label: "Past Bookings" },
                  { icon: "⭐", value: "—", label: "Reviews Given" },
                  { icon: "❤️", value: "0", label: "Saved Vehicles" },
                ].map((s) => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.infoPanel}>
                <h3>Quick Info</h3>
                {[
                  { label: "Full Name",    value: user?.fullName },
                  { label: "Email",        value: user?.email },
                  { label: "Phone",        value: user?.phone },
                  { label: "Account Type", value: "Customer" },
                ].map((r) => (
                  <div key={r.label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{r.label}</span>
                    <span className={styles.infoValue}>{r.value || "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "profile" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Update Profile</h2>
              <p className={styles.sectionSub}>Manage your personal information.</p>
              <div className={styles.comingSoon}>
                <div className={styles.comingSoonIcon}>🛠️</div>
                <p>Profile editing is coming soon.</p>
              </div>
            </section>
          )}

          {activeSection === "account" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Account Settings</h2>
              <p className={styles.sectionSub}>Manage your security and preferences.</p>
              <div className={styles.comingSoon}>
                <div className={styles.comingSoonIcon}>🔒</div>
                <p>Account settings are coming soon.</p>
              </div>
            </section>
          )}

          {activeSection === "business" && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Become a Business Owner</h2>
              <p className={styles.sectionSub}>
                Upgrade your account to start listing vehicles and managing your own rental business.
              </p>
              <div className={styles.upgradeCard}>
                <div className={styles.upgradeCardHeader}>
                  <span className={styles.upgradeIcon}>🚀</span>
                  <div>
                    <h3 className={styles.upgradeCardTitle}>Dealer Account Upgrade</h3>
                    <p className={styles.upgradeCardDesc}>
                      Enter your business name to get started. You can fill in all other details from
                      your Dealer Dashboard after upgrading.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleUpgrade} className={styles.upgradeForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="businessName">Business Name *</label>
                    <input
                      id="businessName"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Premium Auto Rentals"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      disabled={isUpgrading}
                    />
                  </div>
                  {upgradeError && <p className={styles.errorText}>{upgradeError}</p>}
                  <button
                    type="submit"
                    className={styles.upgradeBtn}
                    disabled={isUpgrading || !businessName.trim()}
                  >
                    {isUpgrading ? "Upgrading…" : "🚀 Upgrade to Dealer"}
                  </button>
                </form>
                <ul className={styles.perks}>
                  <li>✅ Create and manage business pages</li>
                  <li>✅ List your vehicles for rent</li>
                  <li>✅ Accept customer bookings</li>
                  <li>✅ Access dealer analytics (coming soon)</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

/** Exported page wraps inner component in Suspense (required by Next.js for useSearchParams) */
export default function CustomerDashboard() {
  return (
    <Suspense fallback={<div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading dashboard…</div>}>
      <CustomerDashboardInner />
    </Suspense>
  );
}
