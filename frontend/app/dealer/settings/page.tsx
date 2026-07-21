"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  createDealerPage,
  listDealerPages,
  updateDealerPage,
} from "@/services/dealer.service";
import { getFriendlyError } from "@/services/auth.service";
import type { DealerPage } from "@/types/auth.types";
import styles from "./page.module.css";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormMode = "create" | "edit";

interface PageFormState {
  businessName: string;
  slug: string;
  description: string;
  businessType: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  businessAddress: string;
  cityRegion: string;
  logoFile: File | null;
  logoPreview: string;
  bannerFile: File | null;
  bannerPreview: string;
  pagePassword: string;
}

const emptyForm = (): PageFormState => ({
  businessName: "",
  slug: "",
  description: "",
  businessType: "",
  ownerName: "",
  contactEmail: "",
  contactPhone: "",
  contactWhatsapp: "",
  businessAddress: "",
  cityRegion: "",
  logoFile: null,
  logoPreview: "",
  bannerFile: null,
  bannerPreview: "",
  pagePassword: "",
});

function pageToForm(page: DealerPage): PageFormState {
  return {
    businessName: page.businessName,
    slug: page.slug,
    description: page.description || "",
    businessType: page.businessType || "",
    ownerName: page.ownerName || "",
    contactEmail: page.contactEmail || "",
    contactPhone: page.contactPhone || "",
    contactWhatsapp: page.contactWhatsapp || "",
    businessAddress: page.businessAddress || "",
    cityRegion: page.cityRegion || "",
    logoFile: null,
    logoPreview: page.logoUrl || "",
    bannerFile: null,
    bannerPreview: page.bannerUrl || "",
    pagePassword: "",
  };
}

export default function DealerSettings() {
  const { user } = useAuth();
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [form, setForm] = useState<PageFormState>(emptyForm());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (user?.businessName && formMode === "create" && !form.businessName) {
      setForm((f) => ({
        ...f,
        businessName: user.businessName!,
        slug: toSlug(user.businessName!),
      }));
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

  const openCreateForm = () => {
    setFormMode("create");
    setEditingPageId(null);
    setForm({
      ...emptyForm(),
      businessName: user?.businessName || "",
      slug: toSlug(user?.businessName || ""),
    });
    setError(null);
    setSuccess(null);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const openEditForm = (page: DealerPage) => {
    setFormMode("edit");
    setEditingPageId(page.id);
    setForm(pageToForm(page));
    setError(null);
    setSuccess(null);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingPageId(null);
    setForm(emptyForm());
    setError(null);
  };

  const setField = (key: keyof PageFormState, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleLogoFile = (file: File) => {
    setField("logoFile", file);
    setField("logoPreview", URL.createObjectURL(file));
  };

  const handleBannerFile = (file: File) => {
    setField("bannerFile", file);
    setField("bannerPreview", URL.createObjectURL(file));
  };

  const handleSlugGeneration = (name: string) => {
    setField("businessName", name);
    // Only auto-generate slug when creating; in edit mode the dealer can keep their slug
    if (formMode === "create") setField("slug", toSlug(name));
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("businessName", form.businessName);
    fd.append("slug", form.slug);
    if (form.description) fd.append("description", form.description);
    if (form.businessType) fd.append("businessType", form.businessType);
    if (form.ownerName) fd.append("ownerName", form.ownerName);
    if (form.contactEmail) fd.append("contactEmail", form.contactEmail);
    if (form.contactPhone) fd.append("contactPhone", form.contactPhone);
    if (form.contactWhatsapp) fd.append("contactWhatsapp", form.contactWhatsapp);
    if (form.businessAddress) fd.append("businessAddress", form.businessAddress);
    if (form.cityRegion) fd.append("cityRegion", form.cityRegion);
    if (form.pagePassword) fd.append("pagePassword", form.pagePassword);
    if (form.logoFile) fd.append("logo", form.logoFile);
    if (form.bannerFile) fd.append("banner", form.bannerFile);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.slug) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      if (formMode === "create") {
        const newPage = await createDealerPage(buildFormData());
        setPages((prev) => [newPage, ...prev]);
        setSuccess(`"${newPage.businessName}" page created successfully!`);
      } else if (formMode === "edit" && editingPageId) {
        const updated = await updateDealerPage(editingPageId, buildFormData());
        setPages((prev) =>
          prev.map((p) => (p.id === editingPageId ? updated : p))
        );
        setSuccess(`"${updated.businessName}" page updated successfully!`);
      }

      closeForm();
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
            Manage your business pages, profile, logo and banner.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={formMode === "create" ? closeForm : openCreateForm}
        >
          {formMode === "create" ? "✕ Cancel" : "+ Create New Page"}
        </button>
      </header>

      {success && <div className={styles.successBanner}>✓ {success}</div>}

      {/* ── Pages List ─────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Business Pages</h2>

        {isLoadingPages ? (
          <p className={styles.loading}>Loading your pages…</p>
        ) : pages.length > 0 ? (
          <div className={styles.pagesGrid}>
            {pages.map((page) => (
              <div
                key={page.id}
                className={`${styles.pageCard} ${editingPageId === page.id ? styles.pageCardActive : ""}`}
              >
                <div
                  className={styles.cardBanner}
                  style={
                    page.bannerUrl
                      ? { backgroundImage: `url(${page.bannerUrl})` }
                      : undefined
                  }
                >
                  {page.logoUrl && (
                    <img
                      src={page.logoUrl}
                      alt={`${page.businessName} logo`}
                      className={styles.cardLogo}
                    />
                  )}
                </div>
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
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() =>
                          editingPageId === page.id
                            ? closeForm()
                            : openEditForm(page)
                        }
                      >
                        {editingPageId === page.id ? "✕ Cancel" : "✏ Edit"}
                      </button>
                      <Link
                        href={`/business/${page.slug}`}
                        target="_blank"
                        className={styles.viewLink}
                      >
                        View Page →
                      </Link>
                    </div>
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
              onClick={openCreateForm}
            >
              Create your first page
            </button>
          </div>
        )}
      </section>

      {/* ── Create / Edit Form ───────────────────── */}
      {formMode && (
        <section className={styles.section}>
          <form ref={formRef} onSubmit={handleSubmit} className={`${styles.createForm} ${formMode === "edit" ? styles.editForm : ""}`}>
            <h2 className={styles.formTitle}>
              {formMode === "create" ? "Create New Business Page" : "Edit Business Page"}
            </h2>
            <p className={styles.formSubtitle}>
              {formMode === "create"
                ? "Fill in the details below. Only Business Name and URL Slug are required."
                : "Update your page details below. Changes will be visible to visitors immediately after saving."}
            </p>

            {/* Row 1: Name + Slug */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="businessName">Business Name *</label>
                <input
                  id="businessName"
                  type="text"
                  className={styles.input}
                  value={form.businessName}
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
                  value={form.slug}
                  onChange={(e) =>
                    setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="premium-auto-rentals"
                  required
                />
                <span className={styles.fieldHint}>
                  Your page URL: /business/<strong>{form.slug || "your-slug"}</strong>
                </span>
              </div>
            </div>

            {/* Row 2: Business Type + Owner */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="businessType">Business Type</label>
                <input
                  id="businessType"
                  type="text"
                  className={styles.input}
                  value={form.businessType}
                  onChange={(e) => setField("businessType", e.target.value)}
                  placeholder="e.g. Car Rental, Leasing"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="ownerName">Owner Name</label>
                <input
                  id="ownerName"
                  type="text"
                  className={styles.input}
                  value={form.ownerName}
                  onChange={(e) => setField("ownerName", e.target.value)}
                  placeholder="Full name of the owner"
                />
              </div>
            </div>

            {/* Row 3: Email + Phone */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="contactEmail">Contact Email</label>
                <input
                  id="contactEmail"
                  type="email"
                  className={styles.input}
                  value={form.contactEmail}
                  onChange={(e) => setField("contactEmail", e.target.value)}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="contactPhone">Contact Phone</label>
                <input
                  id="contactPhone"
                  type="tel"
                  className={styles.input}
                  value={form.contactPhone}
                  onChange={(e) => setField("contactPhone", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Row 4: WhatsApp + City */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="contactWhatsapp">WhatsApp Number</label>
                <input
                  id="contactWhatsapp"
                  type="tel"
                  className={styles.input}
                  value={form.contactWhatsapp}
                  onChange={(e) => setField("contactWhatsapp", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="cityRegion">City / Region</label>
                <input
                  id="cityRegion"
                  type="text"
                  className={styles.input}
                  value={form.cityRegion}
                  onChange={(e) => setField("cityRegion", e.target.value)}
                  placeholder="e.g. Lagos, Abuja"
                />
              </div>
            </div>

            {/* Address */}
            <div className={styles.inputGroup}>
              <label htmlFor="businessAddress">Business Address</label>
              <input
                id="businessAddress"
                type="text"
                className={styles.input}
                value={form.businessAddress}
                onChange={(e) => setField("businessAddress", e.target.value)}
                placeholder="Street address"
              />
            </div>

            {/* Logo + Banner Upload */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Profile Logo</label>
                <div
                  className={styles.fileUploadZone}
                  onClick={() => document.getElementById("logoInput")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleLogoFile(e.dataTransfer.files[0]);
                  }}
                  onPaste={(e) => {
                    const file = e.clipboardData.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                  tabIndex={0}
                >
                  {form.logoPreview ? (
                    <img
                      src={form.logoPreview}
                      alt="Logo preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <p>Click, paste, or drop logo</p>
                  )}
                </div>
                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleLogoFile(e.target.files[0]);
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Profile Banner</label>
                <div
                  className={styles.fileUploadZone}
                  onClick={() => document.getElementById("bannerInput")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleBannerFile(e.dataTransfer.files[0]);
                  }}
                  onPaste={(e) => {
                    const file = e.clipboardData.files?.[0];
                    if (file) handleBannerFile(file);
                  }}
                  tabIndex={0}
                >
                  {form.bannerPreview ? (
                    <div
                      className={styles.previewBanner}
                      style={{ backgroundImage: `url(${form.bannerPreview})` }}
                    />
                  ) : (
                    <p>Click, paste, or drop banner image</p>
                  )}
                </div>
                <input
                  id="bannerInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleBannerFile(e.target.files[0]);
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className={styles.inputGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className={styles.input}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Tell customers about your business…"
                rows={3}
              />
            </div>

            {/* Page Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="pagePassword">
                {formMode === "edit"
                  ? "Change Page Password (leave blank to keep existing)"
                  : "Page Password (Optional)"}
              </label>
              <input
                id="pagePassword"
                type="password"
                className={styles.input}
                value={form.pagePassword}
                onChange={(e) => setField("pagePassword", e.target.value)}
                placeholder="Leave blank for a public page"
              />
            </div>

            {error && <p className={styles.errorText}>⚠ {error}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !form.businessName || !form.slug}
              >
                {isSubmitting
                  ? formMode === "create"
                    ? "Creating…"
                    : "Saving…"
                  : formMode === "create"
                  ? "Create Business Page"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
