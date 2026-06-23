"use client";

import Link from "next/link";
import styles from "./DealerDashboard.module.css";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/utils/roleRedirect";

export default function DealerDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["dealer"]}>
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.kicker}>{getRoleLabel(user?.role)} dashboard</p>
          <h1>Manage your inventory and dealership workflow.</h1>
          <p>
            Dealer tools can later expand into vehicle listings, stock, pricing,
            bookings, and performance tracking.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <span>Listed vehicles</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Pending leads</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Open bookings</span>
            <strong>0</strong>
          </article>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/dealer/pages/new">
            Start your business
          </Link>
          <Link className={styles.secondaryButton} href="/dealer/pages">
            View business pages
          </Link>
          <Link className={styles.secondaryButton} href="/profile">
            View profile
          </Link>
        </div>
      </section>
    </RoleGuard>
  );
}
