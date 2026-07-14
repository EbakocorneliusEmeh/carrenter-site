"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDealerPageBySlug } from "@/services/dealer.service";
import type { DealerPage } from "@/types/auth.types";
import styles from "./page.module.css";

export default function BusinessPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [page, setPage] = useState<DealerPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);
    getDealerPageBySlug(slug)
      .then((pageData) => setPage(pageData))
      .catch((err: any) => {
        console.error("Failed to load business page:", err);
        setError(err?.message || "Unable to load the business page.");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1>{page?.businessName ?? "Dealer Business Page"}</h1>
          <p className={styles.subtitle}>
            {page ? (
              <>Business page for <strong>{page.businessName}</strong></>
            ) : (
              <>Viewing business page <strong>{slug}</strong></>
            )}
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <Link className={styles.secondaryBtn} href="/dealer/dashboard">
            ← Dealer dashboard
          </Link>
          <Link className={styles.backLink} href="/">
            Home
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.messageBox}>Loading business page…</div>
      ) : error ? (
        <div className={styles.errorBox}>{error}</div>
      ) : !page ? (
        <div className={styles.messageBox}>Business page not found.</div>
      ) : (
        <article className={styles.businessCard}>
          {page.bannerUrl && (
            <div
              className={styles.banner}
              style={{ backgroundImage: `url(${page.bannerUrl})` }}
            />
          )}
          <div className={styles.cardContent}>
            <div className={styles.headline}>
              {page.logoUrl && (
                <img
                  src={page.logoUrl}
                  alt={`${page.businessName} logo`}
                  className={styles.logo}
                />
              )}
              <div>
                <h2>{page.businessName}</h2>
                <div className={styles.pageSlug}>/{page.slug}</div>
                {page.businessType && (
                  <span className={styles.category}>{page.businessType}</span>
                )}
              </div>
            </div>

            {page.description && (
              <p className={styles.description}>{page.description}</p>
            )}

            <div className={styles.detailsGrid}>
              {page.ownerName && (
                <div>
                  <strong>Owner</strong>
                  <p>{page.ownerName}</p>
                </div>
              )}
              {page.contactEmail && (
                <div>
                  <strong>Email</strong>
                  <p>{page.contactEmail}</p>
                </div>
              )}
              {page.contactPhone && (
                <div>
                  <strong>Phone</strong>
                  <p>{page.contactPhone}</p>
                </div>
              )}
              {page.contactWhatsapp && (
                <div>
                  <strong>WhatsApp</strong>
                  <p>{page.contactWhatsapp}</p>
                </div>
              )}
              {page.businessAddress && (
                <div>
                  <strong>Address</strong>
                  <p>{page.businessAddress}</p>
                </div>
              )}
              {page.cityRegion && (
                <div>
                  <strong>City / Region</strong>
                  <p>{page.cityRegion}</p>
                </div>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
