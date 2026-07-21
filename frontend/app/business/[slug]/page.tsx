"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicDealerPageBySlug } from "@/services/dealer.service";
import type { PublicDealerPage } from "@/types/auth.types";
import styles from "./page.module.css";

export default function BusinessPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [page, setPage] = useState<PublicDealerPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    getPublicDealerPageBySlug(slug)
      .then(setPage)
      .catch((err: any) => {
        console.error("Failed to load business page:", err);
        setError(err?.message || "Unable to load the business page.");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading business page…</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className={styles.errorScreen}>
        <div className={styles.errorIcon}>🏢</div>
        <h1>Page Not Found</h1>
        <p>{error || "This business page doesn't exist or is currently inactive."}</p>
        <Link href="/" className={styles.backBtn}>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── HERO BANNER ─────────────────────────────── */}
      <div
        className={styles.heroBanner}
        style={
          page.bannerUrl
            ? { backgroundImage: `url(${page.bannerUrl})` }
            : undefined
        }
      >
        <div className={styles.heroBannerOverlay} />
        <Link href="/" className={styles.homeLink}>← Back to Home</Link>
      </div>

      {/* ── PROFILE HEADER ──────────────────────────── */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderInner}>
          <div className={styles.logoWrapper}>
            {page.logoUrl ? (
              <img
                src={page.logoUrl}
                alt={`${page.businessName} logo`}
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                {page.businessName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className={styles.profileMeta}>
            <h1 className={styles.businessName}>{page.businessName}</h1>
            <div className={styles.metaRow}>
              {page.businessType && (
                <span className={styles.typeBadge}>{page.businessType}</span>
              )}
              {page.cityRegion && (
                <span className={styles.locationBadge}>
                  📍 {page.cityRegion}
                </span>
              )}
              <span className={styles.slugText}>/{page.slug}</span>
            </div>
          </div>

          {/* Contact quick-actions */}
          <div className={styles.quickContact}>
            {page.contactPhone && (
              <a href={`tel:${page.contactPhone}`} className={styles.contactChip}>
                📞 Call
              </a>
            )}
            {page.contactWhatsapp && (
              <a
                href={`https://wa.me/${page.contactWhatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.contactChip} ${styles.contactChipGreen}`}
              >
                💬 WhatsApp
              </a>
            )}
            {page.contactEmail && (
              <a href={`mailto:${page.contactEmail}`} className={styles.contactChip}>
                ✉ Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className={styles.mainContent}>

        {/* About + Contact grid */}
        <div className={styles.infoGrid}>

          {/* About card */}
          {page.description && (
            <div className={styles.infoCard}>
              <h2 className={styles.cardTitle}>About</h2>
              <p className={styles.aboutText}>{page.description}</p>
            </div>
          )}

          {/* Contact details card */}
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Contact & Location</h2>
            <ul className={styles.contactList}>
              {page.ownerName && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>👤</span>
                  <div>
                    <div className={styles.contactLabel}>Owner</div>
                    <div className={styles.contactValue}>{page.ownerName}</div>
                  </div>
                </li>
              )}
              {page.contactEmail && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <div>
                    <div className={styles.contactLabel}>Email</div>
                    <a href={`mailto:${page.contactEmail}`} className={styles.contactValue}>
                      {page.contactEmail}
                    </a>
                  </div>
                </li>
              )}
              {page.contactPhone && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <div>
                    <div className={styles.contactLabel}>Phone</div>
                    <a href={`tel:${page.contactPhone}`} className={styles.contactValue}>
                      {page.contactPhone}
                    </a>
                  </div>
                </li>
              )}
              {page.contactWhatsapp && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>💬</span>
                  <div>
                    <div className={styles.contactLabel}>WhatsApp</div>
                    <a
                      href={`https://wa.me/${page.contactWhatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactValue}
                    >
                      {page.contactWhatsapp}
                    </a>
                  </div>
                </li>
              )}
              {page.businessAddress && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>🏠</span>
                  <div>
                    <div className={styles.contactLabel}>Address</div>
                    <div className={styles.contactValue}>{page.businessAddress}</div>
                  </div>
                </li>
              )}
              {page.cityRegion && (
                <li className={styles.contactItem}>
                  <span className={styles.contactIcon}>📍</span>
                  <div>
                    <div className={styles.contactLabel}>City / Region</div>
                    <div className={styles.contactValue}>{page.cityRegion}</div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── VEHICLE INVENTORY ────────────────────── */}
        <section className={styles.inventorySection}>
          <div className={styles.inventoryHeader}>
            <h2 className={styles.inventoryTitle}>Available Vehicles</h2>
            <span className={styles.vehicleCount}>
              {page.vehicles?.length || 0} listing{(page.vehicles?.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {!page.vehicles || page.vehicles.length === 0 ? (
            <div className={styles.emptyInventory}>
              <div className={styles.emptyIcon}>🚗</div>
              <p>No vehicles available right now. Check back soon!</p>
            </div>
          ) : (
            <div className={styles.vehicleGrid}>
              {page.vehicles.map((vehicle) => (
                <div key={vehicle.id} className={styles.vehicleCard}>
                  <div
                    className={styles.vehicleImage}
                    style={{
                      backgroundImage: `url(${
                        vehicle.images && vehicle.images.length > 0
                          ? vehicle.images[0].url
                          : "/placeholder-car.png"
                      })`,
                    }}
                  >
                    <span className={styles.listingBadge}>
                      {vehicle.listingType === "RENT"
                        ? "For Rent"
                        : vehicle.listingType === "SALE"
                        ? "For Sale"
                        : "Rent & Sale"}
                    </span>
                  </div>

                  <div className={styles.vehicleBody}>
                    <h3 className={styles.vehicleTitle}>
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </h3>

                    <div className={styles.vehicleMeta}>
                      <span>{vehicle.transmission}</span>
                      <span className={styles.dot}>•</span>
                      <span>{vehicle.fuelType}</span>
                    </div>

                    <div className={styles.priceRow}>
                      {(vehicle.listingType === "RENT" || vehicle.listingType === "BOTH") &&
                        vehicle.dailyRentalPrice && (
                          <div className={styles.priceTag}>
                            <span className={styles.priceLabel}>Rent</span>
                            <span className={styles.priceValue}>
                              ${vehicle.dailyRentalPrice}
                              <small>/day</small>
                            </span>
                          </div>
                        )}
                      {(vehicle.listingType === "SALE" || vehicle.listingType === "BOTH") &&
                        vehicle.salePrice && (
                          <div className={styles.priceTag}>
                            <span className={styles.priceLabel}>Buy</span>
                            <span className={styles.priceValue}>
                              ${vehicle.salePrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className={styles.vehicleActions}>
                      {page.contactPhone && (
                        <a
                          href={`tel:${page.contactPhone}`}
                          className={styles.inquireBtn}
                        >
                          📞 Call Dealer
                        </a>
                      )}
                      {page.contactWhatsapp && (
                        <a
                          href={`https://wa.me/${page.contactWhatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in the ${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.inquireBtn} ${styles.whatsappBtn}`}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className={styles.pageFooter}>
        <p>
          Powered by{" "}
          <Link href="/" className={styles.footerLink}>
            CarRenter
          </Link>
        </p>
      </footer>
    </div>
  );
}
