"use client";

import Link from "next/link";
import styles from "./AdminDashboard.module.css";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/utils/roleRedirect";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.kicker}>{getRoleLabel(user?.role)} dashboard</p>
          <h1>Operate the platform from one secure place.</h1>
          <p>
            Admin tools can later manage users, dealers, bookings, approvals, and
            support workflows.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <span>Total users</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Pending approvals</span>
            <strong>0</strong>
          </article>
          <article className={styles.card}>
            <span>Open issues</span>
            <strong>0</strong>
          </article>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/profile">
            View profile
          </Link>
          <Link className={styles.secondaryButton} href="/admin/dashboard">
            Refresh dashboard
          </Link>
        </div>
      </section>
    </RoleGuard>
  );
}
