"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listDealerPages } from "@/services/dealer.service";
import type { DealerPage } from "@/types/auth.types";
import styles from "./page.module.css";

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [pages, setPages] = useState<DealerPage[]>([]);
  // Start as true so we never flash "Create My Business Page" before knowing the real state
  const [pagesLoading, setPagesLoading] = useState(true);

  // Normalise role — backend may return "DEALER" (uppercase) or "dealer" (lowercase)
  const isDealer = user?.role?.toLowerCase() === "dealer";

  useEffect(() => {
    // Once auth finishes loading, decide whether to fetch pages
    if (authLoading) return;
    if (!isDealer) {
      // Not a dealer — no pages to fetch, stop loading
      setPagesLoading(false);
      return;
    }
    setPagesLoading(true);
    listDealerPages()
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .catch(() => setPages([]))
      .finally(() => setPagesLoading(false));
  }, [isDealer, authLoading]);

  const hasPages = pages.length > 0;
  const firstPage = pages[0];

  if (authLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className={styles.title}>
            Welcome back, {user?.fullName || "there"}!
          </h1>
          <p className={styles.subtitle}>{user?.email}</p>
        </div>
      </header>

      {/* Smart CTA Banner */}
      <div className={styles.ctaBanner}>
        {pagesLoading ? (
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>⏳</span>
            <div>
              <h2 className={styles.ctaTitle}>Checking your pages…</h2>
            </div>
          </div>
        ) : isDealer && hasPages ? (
          /* DEALER WITH PAGE → Go to their page */
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>🏢</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Your Business Page is Live!</h2>
              <p className={styles.ctaDesc}>
                Manage your vehicles, edit your page details, and track your
                business performance.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/dealer/dashboard">
                Go to Dealer Dashboard
              </Link>
              <Link className={styles.secondaryBtn} href={`/business/${firstPage.slug}`}>
                View My Page
              </Link>
            </div>
          </div>
        ) : isDealer && !hasPages ? (
          /* DEALER WITH NO PAGE → Create first page */
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>🚀</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>
                You&apos;re a Dealer — Set Up Your Business Page!
              </h2>
              <p className={styles.ctaDesc}>
                You&apos;ve upgraded your account. Now set up your business page
                to start listing vehicles and accepting bookings.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/dealer/settings">
                Create My Business Page
              </Link>
            </div>
          </div>
        ) : (
          /* CUSTOMER → Invite them to become a dealer */
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>💼</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>
                Become a Business Owner
              </h2>
              <p className={styles.ctaDesc}>
                Ready to list your vehicles and grow your rental business?
                Upgrade your account to get started today.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/customer/dashboard?section=business">
                Create Your Business Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

