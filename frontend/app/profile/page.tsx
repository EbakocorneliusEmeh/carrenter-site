"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ProfileSettings from "@/components/ProfileSettings";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect unauthenticated users
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuth}>
          <h2>Access Denied</h2>
          <p>You need to be logged in to access this page.</p>
          <Link href="/login" className={styles.loginLink}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
      </div>
      <ProfileSettings />
    </div>
  );
}
