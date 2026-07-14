"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./Login.module.css";
import { useAuth } from "@/hooks/useAuth";
// Redirects go to unified `/dashboard`
import { getFriendlyError } from "@/services/auth.service";

interface LoginFormState {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, authError, clearError } = useAuth();
  const [form, setForm] = useState<LoginFormState>({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    if (!form.identifier.trim()) {
      return "Enter your email or phone number.";
    }

    if (!form.password.trim()) {
      return "Enter your password.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      setSuccess(session.message ?? "Logged in successfully.");
      window.location.href = "/dashboard";
    } catch (error) {
      setError(getFriendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const feedback = error || authError || success;

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>Welcome back</p>
          <h1>Login to your account</h1>
          <p>
            Use your email or phone number and password to access the platform.
          </p>
        </div>

        {feedback ? (
          <div
            className={`${styles.message} ${
              error || authError ? styles.error : styles.success
            }`}
          >
            {feedback}
          </div>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email or phone</span>
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              type="text"
              autoComplete="username"
              placeholder="you@example.com or +237..."
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
            />
          </label>

          <div className={styles.linksRow}>
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/register">Create an account</Link>
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
