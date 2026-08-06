"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listDealerPages } from "@/services/dealer.service";
import { listPublicVehicles } from "@/services/public-vehicles.service";
import { toggleFavorite, getUserFavorites } from "@/services/favorites.service";
import { getVehicleReviews, type ReviewSummary, type Review } from "@/services/reviews.service";
import type { DealerPage } from "@/types/auth.types";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";
import BookingModal from "@/components/BookingModal";
import { useToast } from "@/components/Toast";

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterFuel, setFilterFuel] = useState<string>("ALL");

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
      showToast("Please log in to save vehicles to your favorites.", "warning");
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
      showToast(msg, "error");
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
      const matchLoc = v.pickupLocation?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchModel && !matchFuel && !matchTrans && !matchLoc) return false;
    }
    if (filterType !== "ALL" && v.listingType !== filterType) return false;
    if (filterFuel !== "ALL" && v.fuelType?.toLowerCase() !== filterFuel.toLowerCase()) return false;
    return true;
  });

  // Derive unique fuel types from loaded vehicles
  const fuelTypes = ["ALL", ...Array.from(new Set(vehicles.map(v => v.fuelType).filter(Boolean)))];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.globalBackground}>
        <Image
          src="/images/dashboard-bg-2.png"
          alt="Luxury Dashboard"
          fill
          className={styles.globalImage}
          priority
        />
        <div className={styles.globalOverlay} />
      </div>

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

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type:</span>
            {["ALL", "RENT", "SALE", "BOTH"].map((type) => (
              <button
                key={type}
                className={`${styles.filterChip} ${filterType === type ? styles.filterChipActive : ""}`}
                onClick={() => setFilterType(type)}
              >
                {type === "ALL" ? "All" : type === "RENT" ? "Rent" : type === "SALE" ? "Sale" : "Rent & Buy"}
              </button>
            ))}
          </div>
          {fuelTypes.length > 1 && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Fuel:</span>
              {fuelTypes.map((fuel) => (
                <button
                  key={fuel}
                  className={`${styles.filterChip} ${filterFuel === fuel ? styles.filterChipActive : ""}`}
                  onClick={() => setFilterFuel(fuel || "ALL")}
                >
                  {fuel === "ALL" ? "All" : fuel}
                </button>
              ))}
            </div>
          )}
          {(filterType !== "ALL" || filterFuel !== "ALL") && (
            <button
              className={styles.filterClear}
              onClick={() => { setFilterType("ALL"); setFilterFuel("ALL"); }}
            >
              ✕ Clear filters
            </button>
          )}
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
                {/* Image */}
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0].url} alt={vehicle.name} className={styles.vehicleCardImage} />
                ) : (
                  <div className={styles.vehicleCardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#f1f5f9' }}>🚗</div>
                )}

                {/* Badge overlaid on image */}
                <span className={`${styles.vehicleCardBadge} ${getBadgeClass(vehicle.listingType)}`}>
                  {vehicle.listingType}
                </span>

                {/* Favourite */}
                <button
                  className={`${styles.favoriteBtn} ${favorites.has(vehicle.id) ? styles.favoriteActive : ''}`}
                  onClick={(e) => handleToggleFavorite(e, vehicle.id)}
                  aria-label="Save to favorites"
                >
                  {favorites.has(vehicle.id) ? '❤️' : '🤍'}
                </button>

                {/* Body */}
                <div className={styles.vehicleCardBody}>
                  <h3 className={styles.vehicleCardTitle}>
                    {vehicle.brand} {vehicle.model} <span className={styles.vehicleYear}>({vehicle.year})</span>
                  </h3>

                  <div className={styles.vehicleCardMeta}>
                    <span className={styles.vehicleCardSpecs}>{vehicle.fuelType} · {vehicle.transmission}</span>
                    {vehicle.totalReviews && vehicle.totalReviews > 0 ? (
                      <span className={styles.vehicleCardRating}>★ {vehicle.averageRating} ({vehicle.totalReviews})</span>
                    ) : (
                      <span className={styles.vehicleCardNew}>No reviews</span>
                    )}
                  </div>

                  <p className={styles.vehicleCardPrice}>{getPriceLabel(vehicle)}</p>

                  <p className={styles.vehicleCardMini}>
                    📍 {vehicle.pickupLocation}
                    {vehicle.dealer?.slug && (
                      <> · Listed by: <Link href={`/business/${vehicle.dealer.slug}`} className={styles.dealerLink}>{vehicle.dealer.businessName}</Link></>
                    )}
                  </p>

                  <div className={styles.cardActions}>
                    <button className={styles.viewMoreBtn} onClick={() => setSelectedVehicle(vehicle)}>
                      View Details
                    </button>
                    <a
                      href="#"
                      className={`${styles.rentBtn} ${!vehicle.isAvailable ? styles.rentBtnDisabled : ''}`}
                      onClick={(e) => { e.preventDefault(); if (vehicle.isAvailable) setBookingVehicle(vehicle); }}
                    >
                      {!vehicle.isAvailable ? 'Unavailable' : vehicle.listingType === 'SALE' ? 'Enquire' : 'Rent Now'}
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Reviews Dropdown (shows latest first, expandable)
   ═══════════════════════════════════════════════════════ */


function ReviewCard({ rev }: { rev: Review }) {
  return (
    <div className={styles.reviewItem}>
      <div className={styles.reviewHeader}>
        <strong>{rev.reviewerName}</strong>
        <span className={styles.reviewDate}>
          {new Date(rev.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
      <div className={styles.reviewStars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < rev.rating ? "#fbbf24" : "var(--surface-border)" }}>★</span>
        ))}
      </div>
      {rev.comment && <p className={styles.reviewComment}>{rev.comment}</p>}
    </div>
  );
}

function ReviewsDropdown({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false);

  // Latest review is always first (backend already orders desc)
  const latest = reviews[0];
  const rest = reviews.slice(1);
  const hasMore = rest.length > 0;

  return (
    <div className={styles.reviewsListBlock}>
      <div className={styles.reviewsHeader}>
        <h3 className={styles.featuresTitle}>Customer Reviews</h3>
        {hasMore && (
          <button
            className={styles.reviewsToggleBtn}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "▲ Show less" : `▼ Show all ${reviews.length} reviews`}
          </button>
        )}
      </div>

      <div className={styles.reviewsList}>
        {/* Always show the latest */}
        <ReviewCard rev={latest} />

        {/* Show rest only when expanded */}
        {expanded && rest.map((rev) => (
          <ReviewCard key={rev.id} rev={rev} />
        ))}
      </div>
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
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];

  useEffect(() => {
    getVehicleReviews(vehicle.id).then(setReviewSummary).catch(console.error);
  }, [vehicle.id]);

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

            {/* Rating Summary */}
            {reviewSummary && reviewSummary.totalReviews > 0 && (
              <div className={styles.detailRatingBlock}>
                <div className={styles.detailRatingHeader}>
                  <span className={styles.detailRatingScore}>{reviewSummary.averageRating}</span>
                  <span className={styles.detailRatingStar}>★</span>
                </div>
                <div className={styles.detailRatingText}>
                  Based on {reviewSummary.totalReviews} review{reviewSummary.totalReviews > 1 ? 's' : ''}
                </div>
              </div>
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

            {/* Reviews List */}
            {reviewSummary && reviewSummary.totalReviews > 0 && (
              <ReviewsDropdown reviews={reviewSummary.reviews} />
            )}

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
