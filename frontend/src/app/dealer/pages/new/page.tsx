"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { createDealerPage } from "@/services/dealer.service";
import { getFriendlyError } from "@/services/auth.service";
import type { DealerPageStatus } from "@/types/auth.types";
import styles from "../DealerPageForm.module.css";

const statusOptions: { label: string; value: DealerPageStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

export default function NewDealerPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pagePassword, setPagePassword] = useState("");
  const [status, setStatus] = useState<DealerPageStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    if (!businessName.trim()) return "Enter a business name.";
    if (!slug.trim()) return "Enter a slug for the page.";
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug.trim())) {
      return "Slug must be lowercase, alphanumeric, and may include hyphens.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const page = await createDealerPage({
        businessName: businessName.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        pagePassword: pagePassword.trim() || undefined,
        status,
      });

      router.push(`/dealer/pages/${page.id}`);
    } catch (exception) {
      setError(getFriendlyError(exception));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    setSlug(event.target.value.toLowerCase());
  }

  return (
    <RoleGuard allowedRoles={["dealer"]}>
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.kicker}>Create business page</p>
            <h1>New dealer page</h1>
            <p>
              Add a new business page with a unique slug, description, and status.
              Password protection is optional.
            </p>
          </div>

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Business name</span>
              <input
                className={styles.input}
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                type="text"
                placeholder="My dealer business"
              />
            </label>

            <label className={styles.field}>
              <span>Slug</span>
              <input
                className={styles.input}
                value={slug}
                onChange={handleSlugChange}
                type="text"
                placeholder="my-dealer-page"
              />
            </label>

            <label className={styles.field}>
              <span>Description</span>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional summary for this page"
              />
            </label>

            <label className={styles.field}>
              <span>Page password (optional)</span>
              <input
                className={styles.input}
                value={pagePassword}
                onChange={(event) => setPagePassword(event.target.value)}
                type="password"
                placeholder="Leave blank for no password"
              />
            </label>

            <label className={styles.field}>
              <span>Status</span>
              <select
                className={styles.select}
                value={status}
                onChange={(event) => setStatus(event.target.value as DealerPageStatus)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.actions}>
              <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating page..." : "Create page"}
              </button>
              <Link className={styles.secondaryButton} href="/dealer/pages">
                Back to pages
              </Link>
            </div>
          </form>
        </div>
      </section>
    </RoleGuard>
  );
}
