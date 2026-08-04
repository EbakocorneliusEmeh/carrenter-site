"use client";

import { useEffect, useState } from "react";
import { getUserFavorites, toggleFavorite } from "@/services/favorites.service";
import type { Vehicle } from "@/types/vehicle.types";
import BookingModal from "@/components/BookingModal";
import Link from "next/link";
import dashboardStyles from "../dashboard/page.module.css";
import styles from "./page.module.css";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ favoriteId: string, savedAt: string, vehicle: Vehicle }[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getUserFavorites();
      setFavorites(data);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (vehicleId: string) => {
    try {
      setFavorites(prev => prev.filter(f => f.vehicle.id !== vehicleId));
      await toggleFavorite(vehicleId);
    } catch (err) {
      console.error("Failed to remove favorite", err);
      fetchFavorites(); // Revert on failure
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading your wishlist...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Wishlist ❤️</h1>
        <p className={styles.subtitle}>Vehicles you have saved for later.</p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🚗</div>
          <h3>Your wishlist is empty</h3>
          <p>You haven't saved any vehicles yet. Head back to the dashboard to find your perfect ride!</p>
          <Link href="/dashboard" className={styles.browseBtn}>Browse Vehicles</Link>
        </div>
      ) : (
        <div className={dashboardStyles.vehiclesGrid}>
          {favorites.map(({ vehicle }) => (
            <div key={vehicle.id} className={dashboardStyles.vehicleCard}>
              {/* Image */}
              {vehicle.images && vehicle.images.length > 0 ? (
                <img src={vehicle.images[0].url} alt={vehicle.name} className={dashboardStyles.vehicleCardImage} />
              ) : (
                <div className={dashboardStyles.vehicleCardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: '#f1f5f9' }}>🚗</div>
              )}

              {/* Badge overlaid on image */}
              <span className={`${dashboardStyles.vehicleCardBadge} ${vehicle.listingType === 'RENT' ? dashboardStyles.badgeRent : vehicle.listingType === 'SALE' ? dashboardStyles.badgeSale : dashboardStyles.badgeBoth}`}>
                {vehicle.listingType || 'RENT'}
              </span>

              {/* Favourite Remove */}
              <button
                className={`${dashboardStyles.favoriteBtn} ${dashboardStyles.favoriteActive}`}
                onClick={(e) => { e.stopPropagation(); handleRemove(vehicle.id); }}
                aria-label="Remove from favorites"
              >
                ❤️
              </button>

              {/* Body */}
              <div className={dashboardStyles.vehicleCardBody}>
                <h3 className={dashboardStyles.vehicleCardTitle}>
                  {vehicle.brand} {vehicle.model} <span className={dashboardStyles.vehicleYear}>({vehicle.year})</span>
                </h3>

                <div className={dashboardStyles.vehicleCardMeta}>
                  <span className={dashboardStyles.vehicleCardSpecs}>{vehicle.fuelType} · {vehicle.transmission}</span>
                </div>

                <p className={dashboardStyles.vehicleCardPrice}>
                  {vehicle.listingType === 'RENT' ? `${vehicle.dailyRentalPrice} FCFA/day` : vehicle.listingType === 'SALE' ? `${vehicle.salePrice} FCFA` : `${vehicle.dailyRentalPrice} FCFA/day · ${vehicle.salePrice} FCFA (Buy)`}
                </p>

                <p className={dashboardStyles.vehicleCardMini}>
                  📍 {vehicle.pickupLocation}
                  {vehicle.dealer?.slug && (
                    <> · Listed by: <Link href={`/business/${vehicle.dealer.slug}`} className={dashboardStyles.dealerLink}>{vehicle.dealer.businessName}</Link></>
                  )}
                </p>

                <div className={dashboardStyles.cardActions}>
                  <Link href="/dashboard" className={dashboardStyles.viewMoreBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                    Dashboard
                  </Link>
                  <button
                    className={`${dashboardStyles.rentBtn} ${!vehicle.isAvailable ? dashboardStyles.rentBtnDisabled : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (vehicle.isAvailable) setBookingVehicle(vehicle);
                    }}
                    disabled={!vehicle.isAvailable}
                  >
                    {vehicle.isAvailable ? "Rent / Buy" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </div>
  );
}
