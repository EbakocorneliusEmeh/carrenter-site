"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/axios";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post("/api/v1/auth/forgot-password", { identifier });
      setMessage(res.data?.message || "Check your email for a reset link. Click it to set a new password.");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(" ") : msg || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Account Recovery</p>
          <h1>Forgot your password?</h1>
          <p>
            Enter your registered email or phone number. We&apos;ll send a
            password reset link to your email address.
          </p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles.success}`}>
            ✓ {message}
          </div>
        )}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

        {!message && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email or phone number</span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or +1234567890"
                autoComplete="username"
                autoFocus
              />
            </label>

            <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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
