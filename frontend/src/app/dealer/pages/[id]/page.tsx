"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import {
  deleteDealerPage,
  getDealerPage,
  updateDealerPage,
} from "@/services/dealer.service";
import { getFriendlyError } from "@/services/auth.service";
import type { DealerPage, DealerPageStatus } from "@/types/auth.types";
import styles from "../DealerPageForm.module.css";

const statusOptions: { label: string; value: DealerPageStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

export default function DealerPageDetails() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id as string;

  const [page, setPage] = useState<DealerPage | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pagePassword, setPagePassword] = useState("");
  const [status, setStatus] = useState<DealerPageStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadPage() {
      setError(null);
      setIsLoading(true);

      try {
        const result = await getDealerPage(pageId);
        setPage(result);
        setBusinessName(result.businessName);
        setSlug(result.slug);
        setDescription(result.description ?? "");
        setStatus(result.status);
      } catch (exception) {
        setError(getFriendlyError(exception));
      } finally {
        setIsLoading(false);
      }
    }

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

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
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await updateDealerPage(pageId, {
        businessName: businessName.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        pagePassword: pagePassword.trim() || undefined,
        status,
      });

      setPage(updated);
      setMessage("Business page updated successfully.");
      setPagePassword("");
    } catch (exception) {
      setError(getFriendlyError(exception));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this business page? This cannot be undone.")) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      await deleteDealerPage(pageId);
      router.push("/dealer/pages");
    } catch (exception) {
      setError(getFriendlyError(exception));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={["dealer"]}>
        <section className={styles.page}>
          <div className={styles.card}>
            <p>Loading page details...</p>
          </div>
        </section>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["dealer"]}>
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <p className={styles.kicker}>Business page</p>
            <h1>Edit page details</h1>
            <p>
              Update the page name, slug, description, status, or password.
              The password is optional and is not shown after creation.
            </p>
          </div>

          {error ? <div className={`${styles.message} ${styles.error}`}>{error}</div> : null}
          {message ? <div className={`${styles.message} ${styles.success}`}>{message}</div> : null}

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
                onChange={(event) => setSlug(event.target.value.toLowerCase())}
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
                placeholder="Leave blank to keep existing password"
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
                {isSubmitting ? "Saving changes..." : "Save changes"}
              </button>
              <Link className={styles.secondaryButton} href="/dealer/pages">
                Back to pages
              </Link>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete page"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </RoleGuard>
  );
}
