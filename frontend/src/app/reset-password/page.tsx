"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import styles from "./ResetPassword.module.css";
import { getFriendlyError, resetPassword } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";
  const initialToken = useMemo(() => tokenFromQuery, [tokenFromQuery]);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError("Enter the reset token.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Create a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token: token.trim(),
        newPassword,
      });

      setSuccess(response.message ?? "Password updated successfully.");
    } catch (error) {
      setError(getFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Reset password</p>
          <h1>Set a new password</h1>
          <p>
            Use the token from your email or recovery flow to complete the
            password reset.
          </p>
        </div>

        {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
        {success ? (
          <div className={`${styles.message} ${styles.success}`}>{success}</div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Token</span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              type="text"
              placeholder="Paste the token here"
            />
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>New password</span>
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>

            <label className={styles.field}>
              <span>Confirm password</span>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
              />
            </label>
          </div>

          <div className={styles.linksRow}>
            <Link href="/forgot-password">Need a new token?</Link>
            <Link href="/login">Back to login</Link>
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </section>
  );
}
