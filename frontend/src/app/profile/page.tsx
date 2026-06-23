"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardPath, getRoleLabel } from "@/utils/roleRedirect";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.kicker}>Account profile</p>
            <h1>Your profile</h1>
            <p>Review the identity and role stored in the auth context.</p>
          </div>

          {isLoading || !user ? (
            <Loader label="Loading profile..." />
          ) : (
            <div className={styles.content}>
              <div className={styles.profileGrid}>
                <div className={styles.block}>
                  <span>Full name</span>
                  <strong>{user.fullName}</strong>
                </div>
                <div className={styles.block}>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div className={styles.block}>
                  <span>Phone</span>
                  <strong>{user.phone}</strong>
                </div>
                <div className={styles.block}>
                  <span>Role</span>
                  <strong>{getRoleLabel(user.role)}</strong>
                </div>
                <div className={styles.block}>
                  <span>Business name</span>
                  <strong>{user.businessName ?? "Not provided"}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <Link className={styles.secondaryButton} href={getDashboardPath(user.role)}>
                  Go to dashboard
                </Link>
                <button type="button" className={styles.primaryButton} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
