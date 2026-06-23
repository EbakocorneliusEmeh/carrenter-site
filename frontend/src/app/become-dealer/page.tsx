"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { becomeDealer, getFriendlyError } from "@/services/auth.service";
import styles from "./BecomeDealer.module.css";

export default function BecomeDealerPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setBusinessName(event.target.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const name = businessName.trim();
    if (!name) {
      setError("Enter your business name to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await becomeDealer({ businessName: name });
      if (!session.tokens) {
        await refreshSession();
      }

      setSuccess("Your account has been upgraded. Redirecting to business pages...");
      router.replace("/dealer/pages/new");
    } catch (exception) {
      setError(getFriendlyError(exception));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["customer"]}>
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.kicker}>Dealer upgrade</p>
            <h1>Become a dealer</h1>
            <p>
              Keep your current customer account and add dealer capabilities by
              submitting your business name.
            </p>
          </div>

          {error || success ? (
            <div
              className={`${styles.message} ${error ? styles.error : styles.success}`}
            >
              {error || success}
            </div>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Business name</span>
              <input
                name="businessName"
                value={businessName}
                onChange={handleChange}
                type="text"
                autoComplete="organization"
                placeholder="Your company or dealership name"
              />
            </label>

            <button className={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Upgrade account"}
            </button>
          </form>
        </div>
      </section>
    </RoleGuard>
  );
}
