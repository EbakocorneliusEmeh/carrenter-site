"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import styles from "../forgot-password/page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  // Supabase puts the recovery token in the URL hash after the user clicks
  // the email link: /reset-password#access_token=xxx&type=recovery
  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove leading #
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const type = params.get("type");

    if (!accessToken || type !== "recovery") {
      setTokenError(true);
      return;
    }

    setToken(accessToken);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token,
        password,
      });
      setMessage("Your password has been updated successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(" ")
          : msg || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Invalid or missing token
  if (tokenError) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.kicker}>Password Reset</p>
            <h1>Invalid Link</h1>
            <p>
              This reset link is invalid or has expired. Please request a new
              one.
            </p>
          </div>
          <div className={styles.footer}>
            <Link href="/forgot-password">← Request a new reset link</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Password Reset</p>
          <h1>Set New Password</h1>
          <p>Enter your new password below. Make sure it&apos;s at least 6 characters.</p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles.success}`}>
            ✓ {message} Redirecting to login…
          </div>
        )}
        {error && (
          <div className={`${styles.message} ${styles.error}`}>{error}</div>
        )}

        {!message && token && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>New Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoFocus
              />
            </label>

            <label className={styles.field}>
              <span>Confirm Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
              />
            </label>

            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link href="/login">← Back to Login</Link>
        </div>
      </div>
    </section>
  );
}
