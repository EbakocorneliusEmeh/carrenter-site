"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { listVehicles, deleteVehicle } from "@/services/vehicles.service";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";
import { useToast } from "@/components/Toast";

export default function VehiclesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await listVehicles();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to load vehicles", error);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    setDeletingId(id);
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      showToast("Vehicle deleted successfully.", "success");
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      showToast("Failed to delete vehicle. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading vehicles...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.globalBackground}>
        <Image
          src="/images/dealer-bg.png"
          alt="Dealer Dashboard"
          fill
          className={styles.globalImage}
          priority
        />
        <div className={styles.globalOverlay} />
      </div>

      <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Vehicles</h1>
        <Link href="/dealer/vehicles/new" className={styles.addButton}>
          + Add Vehicle
        </Link>
      </header>

      {vehicles.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't listed any vehicles yet.</p>
          <Link href="/dealer/vehicles/new" className={styles.addButton}>
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className={styles.card}>
              <div className={styles.cardImagePlaceholder}>
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0].url} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  "No Image Available"
                )}
              </div>
              <div className={styles.cardContent}>
                <span
                  className={`${styles.badge} ${
                    vehicle.listingType === ListingType.RENT
                      ? styles.badgeRent
                      : styles.badgeSale
                  }`}
                >
                  {vehicle.listingType}
                </span>
                <h3 className={styles.cardTitle}>{vehicle.brand} {vehicle.model} ({vehicle.year})</h3>
                <p className={styles.cardDetails}>
                  {vehicle.fuelType} • {vehicle.transmission}
                </p>
                <div className={styles.price}>
                  {vehicle.listingType === ListingType.RENT || vehicle.listingType === ListingType.BOTH
                    ? `${vehicle.dailyRentalPrice?.toLocaleString()} FCFA/day `
                    : ""}
                  {vehicle.listingType === ListingType.SALE || vehicle.listingType === ListingType.BOTH
                    ? `${vehicle.salePrice?.toLocaleString()} FCFA (Buy)`
                    : ""}
                </div>
                {vehicle.dealer && vehicle.dealer.slug && (
                  <p className={styles.vehicleCardDealer} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0' }}>
                    Listed by: <Link href={`/business/${vehicle.dealer.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{vehicle.dealer.businessName}</strong></Link>
                  </p>
                )}
                <div className={styles.cardActions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    👁 View
                  </button>
                  <Link href={`/dealer/vehicles/${vehicle.id}/edit`} className={styles.editBtn}>
                    ✏️ Edit
                  </Link>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={deletingId === vehicle.id}
                  >
                    {deletingId === vehicle.id ? "Deleting..." : "🗑 Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Vehicle Detail Modal (Dealer Preview)
   ═══════════════════════════════════════════════════════ */

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

function VehicleDetailModal({ vehicle, onClose }: VehicleDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];

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
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.modalBody}>
          {/* Image gallery */}
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
                <p>No images uploaded</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.detailsSection}>
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

            {vehicle.dealer && vehicle.dealer.slug && (
              <p className={styles.detailDealer} style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Listed by: <Link href={`/business/${vehicle.dealer.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{vehicle.dealer.businessName}</strong></Link>
              </p>
            )}

            {vehicle.dealer && vehicle.dealer.slug && (
              <p className={styles.detailDealer} style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Listed by: <Link href={`/business/${vehicle.dealer.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{vehicle.dealer.businessName}</strong></Link>
              </p>
            )}

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

            {/* Specs */}
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
              {vehicle.isAvailable ? "✓ Available" : "✗ Unavailable"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
