"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { deleteDealerPage, listDealerPages } from "@/services/dealer.service";
import { getFriendlyError } from "@/services/auth.service";
import type { DealerPage } from "@/types/auth.types";
import styles from "./DealerPages.module.css";

export default function DealerPagesPage() {
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPages() {
      setError(null);
      setIsLoading(true);

      try {
        const result = await listDealerPages();
        setPages(result);
      } catch (exception) {
        setError(getFriendlyError(exception));
      } finally {
        setIsLoading(false);
      }
    }

    loadPages();
  }, []);

  async function handleDelete(pageId: string) {
    if (!window.confirm("Delete this business page? This cannot be undone.")) {
      return;
    }

    setDeletingId(pageId);
    setError(null);

    try {
      await deleteDealerPage(pageId);
      setPages((current) => current.filter((page) => page.id !== pageId));
    } catch (exception) {
      setError(getFriendlyError(exception));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RoleGuard allowedRoles={["dealer"]}>
      <section className={styles.page}>
        <div className={styles.hero}>
          <p className={styles.kicker}>Business pages</p>
          <h1>Manage your dealer pages</h1>
          <p>
            Create and manage one or more business pages for your dealership.
            Password-protected pages can be added later when needed.
          </p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/dealer/pages/new">
            Create new page
          </Link>
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        {isLoading ? (
          <div className={styles.loader}>Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className={styles.empty}>
            <h2>No business pages yet</h2>
            <p>Create your first page to start listing your business details.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {pages.map((page) => (
              <article key={page.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.status}>{page.status}</span>
                  <strong>{page.businessName}</strong>
                </div>
                <p>{page.description ?? "No description provided."}</p>
                <div className={styles.meta}>
                  <span>Slug: {page.slug}</span>
                  <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.cardActions}>
                  <Link className={styles.linkButton} href={`/dealer/pages/${page.id}`}>
                    View / Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingId === page.id}
                  >
                    {deletingId === page.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </RoleGuard>
  );
}
