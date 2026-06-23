"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import styles from "./ForgotPassword.module.css";
import { forgotPassword, getFriendlyError } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Enter the email tied to your account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email: email.trim() });
      setSuccess(
        response.message ??
          "If the email exists, a password reset link or token has been sent.",
      );
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
          <p className={styles.kicker}>Password recovery</p>
          <h1>Forgot your password?</h1>
          <p>
            Enter the email used on your account and we will send the reset
            instructions.
          </p>
        </div>

        {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
        {success ? (
          <div className={`${styles.message} ${styles.success}`}>{success}</div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <div className={styles.linksRow}>
            <Link href="/login">Back to login</Link>
            <Link href="/reset-password">Have a reset token?</Link>
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset instructions"}
          </button>
        </form>
      </div>
    </section>
  );
}
