"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listDealerPages } from "@/services/dealer.service";
import { listPublicVehicles } from "@/services/public-vehicles.service";
import { toggleFavorite, getUserFavorites } from "@/services/favorites.service";
import type { DealerPage } from "@/types/auth.types";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";
import BookingModal from "@/components/BookingModal";

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");

  const isDealer = user?.role?.toLowerCase() === "dealer";

  useEffect(() => {
    if (authLoading) return;
    if (!isDealer) {
      setPagesLoading(false);
      return;
    }
    setPagesLoading(true);
    listDealerPages()
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .catch(() => setPages([]))
      .finally(() => setPagesLoading(false));
  }, [isDealer, authLoading]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await listPublicVehicles();
        setVehicles(data);

        // Fetch favorites if user is logged in
        if (user) {
          const favData = await getUserFavorites();
          const favSet = new Set<string>();
          favData.forEach((f: any) => favSet.add(f.vehicle.id));
          setFavorites(favSet);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setVehiclesLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleToggleFavorite = async (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save vehicles to your favorites.");
      return;
    }

    // Save original state for revert
    const originalFavs = new Set(favorites);

    // Optimistic UI update
    const newFavs = new Set(favorites);
    if (newFavs.has(vehicleId)) {
      newFavs.delete(vehicleId);
    } else {
      newFavs.add(vehicleId);
    }
    setFavorites(newFavs);

    try {
      await toggleFavorite(vehicleId);
    } catch (err: any) {
      // Revert on failure
      setFavorites(originalFavs);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save favorite. Please try again.";
      alert(msg);
    }
  };

  // Listen for openBooking event dispatched from VehicleDetailModal CTA
  useEffect(() => {
    const handler = (e: Event) => {
      const vehicle = (e as CustomEvent<Vehicle>).detail;
      if (vehicle) setBookingVehicle(vehicle);
    };
    window.addEventListener('openBooking', handler);
    return () => window.removeEventListener('openBooking', handler);
  }, []);

  const hasPages = pages.length > 0;
  const firstPage = pages[0];

  if (authLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Loading your dashboard…</p>
      </div>
    );
  }

  function getPriceLabel(vehicle: Vehicle) {
    if (vehicle.listingType === ListingType.RENT) return `${vehicle.dailyRentalPrice} FCFA/day`;
    if (vehicle.listingType === ListingType.SALE) return `${vehicle.salePrice} FCFA`;
    return `${vehicle.dailyRentalPrice} FCFA/day · ${vehicle.salePrice} FCFA (Buy)`;
  }

  function getBadgeClass(type: ListingType) {
    if (type === ListingType.RENT) return styles.badgeRent;
    if (type === ListingType.SALE) return styles.badgeSale;
    return styles.badgeBoth;
  }

  const filteredVehicles = vehicles.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name?.toLowerCase().includes(q);
      const matchBrand = v.brand?.toLowerCase().includes(q);
      const matchModel = v.model?.toLowerCase().includes(q);
      const matchFuel = v.fuelType?.toLowerCase().includes(q);
      const matchTrans = v.transmission?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchModel && !matchFuel && !matchTrans) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Image Modal */}
      {isImageModalOpen && user?.avatarUrl && (
        <div className={styles.imageModal} onClick={() => setIsImageModalOpen(false)}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setIsImageModalOpen(false)}>×</button>
            <Image
              src={user.avatarUrl}
              alt={user.fullName || "Profile"}
              width={500}
              height={500}
              className={styles.fullSizeImage}
            />
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <header className={styles.header}>
        <div className={styles.avatarWrapper} onClick={() => user?.avatarUrl && setIsImageModalOpen(true)} style={{ cursor: user?.avatarUrl ? "pointer" : "default" }}>
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullName || "Profile"}
              width={80}
              height={80}
              className={styles.avatarImg}
            />
          ) : (
            <div className={styles.avatar}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            Welcome back, {user?.fullName || "there"}!
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className={styles.headerSearch}>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder="Search make, model, fuel type, etc..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Smart CTA Banner */}
      <div className={styles.ctaBanner}>
        {pagesLoading ? (
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>⏳</span>
            <div>
              <h2 className={styles.ctaTitle}>Checking your pages…</h2>
            </div>
          </div>
        ) : isDealer && hasPages ? (
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>🏢</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Your Business Page is Live!</h2>
              <p className={styles.ctaDesc}>
                Manage your vehicles, edit your page details, and track your business performance.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/dealer/vehicles">
                Go to Dealer Dashboard
              </Link>
              <Link className={styles.secondaryBtn} href={`/business/${firstPage.slug}`}>
                View My Page
              </Link>
            </div>
          </div>
        ) : isDealer && !hasPages ? (
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>🚀</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>
                You&apos;re a Dealer — Set Up Your Business Page!
              </h2>
              <p className={styles.ctaDesc}>
                You&apos;ve upgraded your account. Now set up your business page to start listing vehicles and accepting bookings.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/dealer/settings">
                Create My Business Page
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.ctaContent}>
            <span className={styles.ctaIcon}>👋</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Manage Your Bookings</h2>
              <p className={styles.ctaDesc}>
                View your current rentals, cancel requests, or track past bookings in your personal dashboard. You can also upgrade to start your own rental business!
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/customer/dashboard?section=rentals">
                Manage My Rentals
              </Link>
              <Link className={styles.secondaryBtn} href="/customer/dashboard?section=business">
                Become a Dealer
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Available Vehicles Section */}
      <section className={styles.vehiclesSection}>
        <div className={styles.vehiclesSectionHeader}>
          <h2 className={styles.sectionTitle}>🚗 Available Vehicles</h2>
        </div>

        {vehiclesLoading ? (
          <p className={styles.vehiclesLoading}>Loading vehicles…</p>
        ) : filteredVehicles.length === 0 ? (
          <div className={styles.emptyVehicles}>
            <p>No vehicles match your search. Try different keywords!</p>
          </div>
        ) : (
          <div className={styles.vehiclesGrid}>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.vehicleCard}>
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0].url}
                    alt={vehicle.name}
                    className={styles.vehicleCardImage}
                  />
                ) : (
                  <div className={styles.vehicleCardImage}>🚗</div>
                )}
                <button 
                  className={`${styles.favoriteBtn} ${favorites.has(vehicle.id) ? styles.favoriteActive : ''}`}
                  onClick={(e) => handleToggleFavorite(e, vehicle.id)}
                  aria-label="Save to favorites"
                >
                  {favorites.has(vehicle.id) ? "❤️" : "🤍"}
                </button>
                <div className={styles.vehicleCardBody}>
                  <span className={`${styles.vehicleCardBadge} ${getBadgeClass(vehicle.listingType)}`}>
                    {vehicle.listingType}
                  </span>
                  <h3 className={styles.vehicleCardTitle}>
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </h3>
                  <p className={styles.vehicleCardDetails}>
                    {vehicle.fuelType} · {vehicle.transmission}
                  </p>
                  <p className={styles.vehicleCardPrice}>{getPriceLabel(vehicle)}</p>
                  <p className={styles.vehicleCardLocation}>📍 {vehicle.pickupLocation}</p>
                  {vehicle.dealer && vehicle.dealer.slug && (
                    <p className={styles.vehicleCardDealer} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      Listed by: <Link href={`/business/${vehicle.dealer.slug}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}><strong>{vehicle.dealer.businessName}</strong></Link>
                    </p>
                  )}
                  <div className={styles.cardActions}>
                    <button 
                      className={styles.viewMoreBtn}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      View Details
                    </button>
                    <a
                      href="#"
                      className={styles.rentBtn}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        if (vehicle.isAvailable) setBookingVehicle(vehicle); 
                      }}
                      style={{
                        opacity: vehicle.isAvailable ? 1 : 0.6,
                        cursor: vehicle.isAvailable ? 'pointer' : 'not-allowed',
                        backgroundColor: vehicle.isAvailable ? '' : 'var(--surface-border)',
                        color: vehicle.isAvailable ? '' : 'var(--text-muted)'
                      }}
                    >
                      {!vehicle.isAvailable ? "Unavailable" : vehicle.listingType === "SALE" ? "Enquire" : "Rent Now"}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Booking Modal */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Vehicle Detail Modal (General Dashboard)
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
                <p>No images available</p>
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

            {/* Modal CTA */}
            <div className={styles.modalCtaBlock}>
              <button
                className={styles.modalRentBtn}
                disabled={!vehicle.isAvailable}
                style={{
                  opacity: vehicle.isAvailable ? 1 : 0.6,
                  cursor: vehicle.isAvailable ? 'pointer' : 'not-allowed',
                  backgroundColor: vehicle.isAvailable ? '' : 'var(--surface-border)',
                  color: vehicle.isAvailable ? '' : 'var(--text-muted)'
                }}
                onClick={() => {
                  if (!vehicle.isAvailable) return;
                  // Close detail modal, open booking modal
                  onClose();
                  // Slight delay so CSS animation doesn't clash
                  setTimeout(() => {
                    const event = new CustomEvent('openBooking', { detail: vehicle });
                    window.dispatchEvent(event);
                  }, 150);
                }}
              >
                {!vehicle.isAvailable ? "Unavailable" : vehicle.listingType === "SALE" ? "Enquire About This Vehicle" : "Rent This Vehicle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
