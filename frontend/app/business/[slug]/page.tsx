"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getPublicDealerPageBySlug } from "@/services/dealer.service";
import type { PublicDealerPage } from "@/types/auth.types";
import type { Vehicle } from "@/types/vehicle.types";
import styles from "./page.module.css";
import BookingModal from "@/components/BookingModal";

export default function BusinessPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [page, setPage] = useState<PublicDealerPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

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
                              {vehicle.dailyRentalPrice} FCFA
                              <small>/day</small>
                            </span>
                          </div>
                        )}
                      {(vehicle.listingType === "SALE" || vehicle.listingType === "BOTH") &&
                        vehicle.salePrice && (
                          <div className={styles.priceTag}>
                            <span className={styles.priceLabel}>Buy</span>
                            <span className={styles.priceValue}>
                              {vehicle.salePrice.toLocaleString()} FCFA
                            </span>
                          </div>
                        )}
                    </div>

                    <p className={styles.vehicleCardDealer} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0 0' }}>
                      Listed by: <Link href={`/business/${page.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{page.businessName}</strong></Link>
                    </p>

                    <div className={styles.vehicleActions}>
                      <button
                        className={styles.viewMoreBtn}
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        View Details →
                      </button>
                      <button
                        className={styles.rentNowBtn}
                        onClick={() => vehicle.isAvailable && setBookingVehicle(vehicle)}
                        disabled={!vehicle.isAvailable}
                        style={{
                          opacity: vehicle.isAvailable ? 1 : 0.6,
                          cursor: vehicle.isAvailable ? 'pointer' : 'not-allowed',
                          backgroundColor: vehicle.isAvailable ? '' : 'var(--surface-border)',
                          color: vehicle.isAvailable ? '' : 'var(--text-muted)'
                        }}
                      >
                        {!vehicle.isAvailable ? "Unavailable" : vehicle.listingType === "SALE" ? "Enquire" : "🚗 Rent Now"}
                      </button>
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

      {/* ── VEHICLE DETAIL MODAL ────────────────────── */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          dealerPage={page}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* ── BOOKING MODAL ───────────────────────────── */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}

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

/* ═══════════════════════════════════════════════════════
   Vehicle Detail Modal
   ═══════════════════════════════════════════════════════ */

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  dealerPage: PublicDealerPage;
  onClose: () => void;
}

function VehicleDetailModal({ vehicle, dealerPage, onClose }: VehicleDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const goToPrev = useCallback(() => {
    setActiveImageIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setActiveImageIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* Close button */}
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.modalBody}>

          {/* ── Image gallery ───────────────── */}
          <div className={styles.gallerySection}>
            {images.length > 0 ? (
              <>
                <div className={styles.galleryMain}>
                  <img
                    src={images[activeImageIndex].url}
                    alt={`${vehicle.brand} ${vehicle.model} - Image ${activeImageIndex + 1}`}
                    className={styles.galleryImage}
                  />
                  {images.length > 1 && (
                    <>
                      <button className={`${styles.galleryNav} ${styles.galleryNavPrev}`} onClick={goToPrev}>‹</button>
                      <button className={`${styles.galleryNav} ${styles.galleryNavNext}`} onClick={goToNext}>›</button>
                      <div className={styles.galleryCounter}>
                        {activeImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className={styles.galleryThumbs}>
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        className={`${styles.galleryThumb} ${idx === activeImageIndex ? styles.galleryThumbActive : ""}`}
                        onClick={() => setActiveImageIndex(idx)}
                      >
                        <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.galleryPlaceholder}>
                <span>🚗</span>
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* ── Details section ──────────────── */}
          <div className={styles.detailsSection}>

            {/* Title & badge */}
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </h2>
              <span className={styles.detailBadge}>
                {vehicle.listingType === "RENT"
                  ? "For Rent"
                  : vehicle.listingType === "SALE"
                  ? "For Sale"
                  : "Rent & Sale"}
              </span>
            </div>

            {vehicle.name && vehicle.name !== `${vehicle.brand} ${vehicle.model}` && (
              <p className={styles.detailSubtitle}>{vehicle.name}</p>
            )}

            <p className={styles.detailDealer} style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Listed by: <Link href={`/business/${dealerPage.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{dealerPage.businessName}</strong></Link>
            </p>

            {/* Pricing */}
            <div className={styles.detailPricing}>
              {(vehicle.listingType === "RENT" || vehicle.listingType === "BOTH") &&
                vehicle.dailyRentalPrice && (
                  <div className={styles.detailPriceCard}>
                    <span className={styles.detailPriceLabel}>Daily Rental</span>
                    <span className={styles.detailPriceValue}>
                      {vehicle.dailyRentalPrice.toLocaleString()} FCFA
                      <small>/day</small>
                    </span>
                  </div>
                )}
              {(vehicle.listingType === "SALE" || vehicle.listingType === "BOTH") &&
                vehicle.salePrice && (
                  <div className={styles.detailPriceCard}>
                    <span className={styles.detailPriceLabel}>Sale Price</span>
                    <span className={styles.detailPriceValue}>
                      {vehicle.salePrice.toLocaleString()} FCFA
                    </span>
                  </div>
                )}
            </div>

            {/* Specs grid */}
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>📅</span>
                <div>
                  <div className={styles.specLabel}>Year</div>
                  <div className={styles.specValue}>{vehicle.year}</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🏷️</span>
                <div>
                  <div className={styles.specLabel}>Brand</div>
                  <div className={styles.specValue}>{vehicle.brand}</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🚗</span>
                <div>
                  <div className={styles.specLabel}>Model</div>
                  <div className={styles.specValue}>{vehicle.model}</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>⛽</span>
                <div>
                  <div className={styles.specLabel}>Fuel Type</div>
                  <div className={styles.specValue}>{vehicle.fuelType}</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>⚙️</span>
                <div>
                  <div className={styles.specLabel}>Transmission</div>
                  <div className={styles.specValue}>{vehicle.transmission}</div>
                </div>
              </div>
              {vehicle.registrationNumber && (
                <div className={styles.specItem}>
                  <span className={styles.specIcon}>🔢</span>
                  <div>
                    <div className={styles.specLabel}>Registration</div>
                    <div className={styles.specValue}>{vehicle.registrationNumber}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className={styles.featuresBlock}>
                <h3 className={styles.featuresTitle}>Features</h3>
                <div className={styles.featuresList}>
                  {vehicle.features.map((feat, idx) => (
                    <span key={idx} className={styles.featureTag}>✓ {feat}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup location */}
            {vehicle.pickupLocation && (
              <div className={styles.pickupBlock}>
                <span className={styles.pickupIcon}>📍</span>
                <div>
                  <div className={styles.pickupLabel}>Pickup Location</div>
                  <div className={styles.pickupValue}>{vehicle.pickupLocation}</div>
                </div>
              </div>
            )}

            {/* Availability */}
            <div className={styles.availabilityBadge} data-available={vehicle.isAvailable}>
              {vehicle.isAvailable ? "✓ Available Now" : "✗ Currently Unavailable"}
            </div>

            {/* Contact actions */}
            <div className={styles.detailActions}>
              {dealerPage.contactPhone && (
                <a
                  href={`tel:${dealerPage.contactPhone}`}
                  className={styles.detailActionBtn}
                >
                  📞 Call Dealer
                </a>
              )}
              {dealerPage.contactWhatsapp && (
                <a
                  href={`https://wa.me/${dealerPage.contactWhatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in the ${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.detailActionBtn} ${styles.detailActionWhatsapp}`}
                >
                  💬 WhatsApp
                </a>
              )}
              {dealerPage.contactEmail && (
                <a
                  href={`mailto:${dealerPage.contactEmail}?subject=Inquiry: ${vehicle.year} ${vehicle.brand} ${vehicle.model}`}
                  className={styles.detailActionBtn}
                >
                  ✉ Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
