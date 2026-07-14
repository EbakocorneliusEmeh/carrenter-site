"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./Register.module.css";
import { useAuth } from "@/hooks/useAuth";
// Redirect to unified main dashboard after registration
import { getFriendlyError } from "@/services/auth.service";
import type { RegisterPayload } from "@/types/auth.types";

interface RegisterFormState extends Omit<RegisterPayload, "businessName" | "role"> {
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, authError, clearError } = useAuth();
  const [form, setForm] = useState<RegisterFormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
    if (!form.fullName.trim()) return "Enter your full name.";
    if (!form.email.trim()) return "Enter your email address.";
    if (!form.phone.trim()) return "Enter your phone number.";
    if (!form.password.trim()) return "Create a password.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";

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
      const session = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (session.tokens) {
        setSuccess(session.message ?? "Account created successfully.");
        window.location.href = "/dashboard";
        return;
      }

      setSuccess(
        session.message ??
          "Account created successfully. Please log in with your new credentials.",
      );
      window.location.href = "/login";
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
          <p className={styles.kicker}>Join CarRent</p>
          <h1>Create your account</h1>
          <p>
            Create a customer account for browsing, booking, and managing your
            rentals. You can upgrade to dealer access later from your dashboard.
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
            <span>Full name</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              type="text"
              autoComplete="name"
              placeholder="John Doe"
            />
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Email</span>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label className={styles.field}>
              <span>Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                autoComplete="tel"
                placeholder="+237 6..."
              />
            </label>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Password</span>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>

            <label className={styles.field}>
              <span>Confirm password</span>
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
              />
            </label>
          </div>


          <div className={styles.linksRow}>
            <Link href="/login">Already have an account?</Link>
            <Link href="/forgot-password">Need password help?</Link>
          </div>

          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
