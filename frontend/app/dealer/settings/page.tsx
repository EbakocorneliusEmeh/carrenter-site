"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createDealerPage, listDealerPages } from "@/services/dealer.service";
import { getFriendlyError } from "@/services/auth.service";
import type { DealerPage } from "@/types/auth.types";
import styles from "./page.module.css";

/** Converts any string into a valid slug: lowercase, alphanumeric + hyphens only */
function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DealerSettings() {
  const { user } = useAuth();
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Required fields
  const initialName = user?.businessName || "";
  const [businessName, setBusinessName] = useState(initialName);
  const [slug, setSlug] = useState(toSlug(initialName));

  // Optional fields
  const [description, setDescription] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [cityRegion, setCityRegion] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [pagePassword, setPagePassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  // Sync fields if user loads after initial render
  useEffect(() => {
    if (user?.businessName && !businessName) {
      setBusinessName(user.businessName);
      setSlug(toSlug(user.businessName));
    }
  }, [user]);

  const fetchPages = async () => {
    try {
      setIsLoadingPages(true);
      const data = await listDealerPages();
      setPages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleSlugGeneration = (name: string) => {
    setBusinessName(name);
    setSlug(toSlug(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !slug) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const newPage = await createDealerPage({
        businessName,
        slug,
        description: description || undefined,
        businessType: businessType || undefined,
        ownerName: ownerName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        contactWhatsapp: contactWhatsapp || undefined,
        businessAddress: businessAddress || undefined,
        cityRegion: cityRegion || undefined,
        logoUrl: logoUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        pagePassword: pagePassword || undefined,
      });

      setPages((prev) => [newPage, ...prev]);
      setSuccess(`"${newPage.businessName}" page created successfully!`);
      setShowForm(false);

      // Reset optional fields
      setDescription("");
      setBusinessType("");
      setOwnerName("");
      setContactEmail("");
      setContactPhone("");
      setContactWhatsapp("");
      setBusinessAddress("");
      setCityRegion("");
      setLogoUrl("");
      setBannerUrl("");
      setPagePassword("");
    } catch (err: any) {
      const raw = getFriendlyError(err);
      setError(Array.isArray(raw) ? raw.join(" | ") : raw);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage your business pages and profile information.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
            setSuccess(null);
            setTimeout(
              () =>
                formRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              100
            );
          }}
        >
          {showForm ? "✕ Cancel" : "+ Create New Page"}
        </button>
      </header>

      {success && <div className={styles.successBanner}>{success}</div>}

      {/* ── Pages List ─────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Business Pages</h2>

        {isLoadingPages ? (
          <p className={styles.loading}>Loading your pages…</p>
        ) : pages.length > 0 ? (
          <div className={styles.pagesGrid}>
            {pages.map((page) => (
              <div key={page.id} className={styles.pageCard}>
                {page.bannerUrl && (
                  <div
                    className={styles.cardBanner}
                    style={{ backgroundImage: `url(${page.bannerUrl})` }}
                  />
                )}
                <div className={styles.cardBody}>
                  <h3 className={styles.pageName}>{page.businessName}</h3>
                  <div className={styles.pageSlug}>/{page.slug}</div>
                  {page.businessType && (
                    <span className={styles.typeBadge}>{page.businessType}</span>
                  )}
                  <p className={styles.pageDesc}>
                    {page.description || "No description provided."}
                  </p>
                  <div className={styles.cardFooter}>
                    <span
                      className={`${styles.statusBadge} ${styles[page.status?.toLowerCase() || "active"]}`}
                    >
                      {page.status}
                    </span>
                    <Link
                      href={`/business/${page.slug}`}
                      className={styles.viewLink}
                    >
                      View Page →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <p>You haven&apos;t created any business pages yet.</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowForm(true)}
            >
              Create your first page
            </button>
          </div>
        )}
      </section>

      {/* ── Create New Page Form ────────────────────── */}
      {showForm && (
        <section className={styles.section}>
          <form ref={formRef} onSubmit={handleSubmit} className={styles.createForm}>
            <h2 className={styles.formTitle}>Create New Business Page</h2>
            <p className={styles.formSubtitle}>
              Fill in the details below. Only Business Name and URL Slug are required.
            </p>

            {/* Row 1: Name + Slug */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="businessName">Business Name *</label>
                <input
                  id="businessName"
                  type="text"
                  className={styles.input}
                  value={businessName}
                  onChange={(e) => handleSlugGeneration(e.target.value)}
                  placeholder="e.g. Premium Auto Rentals"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="slug">URL Slug *</label>
                <input
                  id="slug"
                  type="text"
                  className={styles.input}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="premium-auto-rentals"
                  required
                />
                <span className={styles.fieldHint}>
                  Your page URL: /business/<strong>{slug || "your-slug"}</strong>
                </span>
              </div>
            </div>

            {/* Row 2: Business Type + Owner Name */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="businessType">Business Type</label>
                <input
                  id="businessType"
                  type="text"
                  className={styles.input}
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Car Rental, Leasing"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="ownerName">Owner Name</label>
                <input
                  id="ownerName"
                  type="text"
                  className={styles.input}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Full name of the owner"
                />
              </div>
            </div>

            {/* Row 3: Contact Email + Phone */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="contactEmail">Contact Email</label>
                <input
                  id="contactEmail"
                  type="email"
                  className={styles.input}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="contactPhone">Contact Phone</label>
                <input
                  id="contactPhone"
                  type="tel"
                  className={styles.input}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Row 4: WhatsApp + City/Region */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="contactWhatsapp">WhatsApp Number</label>
                <input
                  id="contactWhatsapp"
                  type="tel"
                  className={styles.input}
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="cityRegion">City / Region</label>
                <input
                  id="cityRegion"
                  type="text"
                  className={styles.input}
                  value={cityRegion}
                  onChange={(e) => setCityRegion(e.target.value)}
                  placeholder="e.g. Lagos, Abuja"
                />
              </div>
            </div>

            {/* Row 5: Address (full width) */}
            <div className={styles.inputGroup}>
              <label htmlFor="businessAddress">Business Address</label>
              <input
                id="businessAddress"
                type="text"
                className={styles.input}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>

            {/* Row 6: Logo URL + Banner URL */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="logoUrl">Logo URL</label>
                <input
                  id="logoUrl"
                  type="url"
                  className={styles.input}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="bannerUrl">Banner URL</label>
                <input
                  id="bannerUrl"
                  type="url"
                  className={styles.input}
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Description */}
            <div className={styles.inputGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your business…"
                rows={3}
              />
            </div>

            {/* Page Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="pagePassword">Page Password (Optional)</label>
              <input
                id="pagePassword"
                type="password"
                className={styles.input}
                value={pagePassword}
                onChange={(e) => setPagePassword(e.target.value)}
                placeholder="Leave blank for a public page"
              />
            </div>

            {error && <p className={styles.errorText}>⚠ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !businessName || !slug}
              >
                {isSubmitting ? "Creating…" : "Create Business Page"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
