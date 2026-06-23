"use client";

import Link from "next/link";
import styles from "./CustomerDashboard.module.css";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardPath, getRoleLabel } from "@/utils/roleRedirect";

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["customer"]}>
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.kicker}>{getRoleLabel(user?.role)} dashboard</p>
          <h1>Plan, book, and manage your rentals.</h1>
          <p>
            This space is ready for bookings, saved vehicles, trip history, and
            account actions.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <span>Active bookings</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Saved cars</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Trips completed</span>
            <strong>0</strong>
          </article>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/profile">
            View profile
          </Link>
          <Link className={styles.primaryButton} href="/become-dealer">
            Become a dealer
          </Link>
          <Link className={styles.secondaryButton} href={getDashboardPath(user?.role)}>
            Refresh dashboard
          </Link>
        </div>
      </section>
    </RoleGuard>
  );
}
