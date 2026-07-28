"use client";

import { useEffect, useState } from "react";
import { getUserFavorites, toggleFavorite } from "@/services/favorites.service";
import type { Vehicle } from "@/types/vehicle.types";
import BookingModal from "@/components/BookingModal";
import Link from "next/link";
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
        <div className={styles.grid}>
          {favorites.map(({ vehicle }) => (
            <div key={vehicle.id} className={styles.card}>
              <button 
                className={styles.removeBtn}
                onClick={() => handleRemove(vehicle.id)}
                aria-label="Remove from favorites"
              >
                ✕
              </button>
              {vehicle.images && vehicle.images.length > 0 ? (
                <img
                  src={vehicle.images[0].url}
                  alt={vehicle.name}
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.cardImagePlaceholder}>🚗</div>
              )}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{vehicle.year} {vehicle.brand} {vehicle.model}</h3>
                <div className={styles.cardPrice}>
                  {vehicle.dailyRentalPrice ? `${vehicle.dailyRentalPrice.toLocaleString()} FCFA / day` : 'Price on request'}
                </div>
                <div className={styles.cardActions}>
                  <Link href={`/dashboard`} className={styles.detailsLink}>View Details</Link>
                  <button 
                    className={styles.rentBtn}
                    onClick={() => setBookingVehicle(vehicle)}
                  >
                    Rent Now
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
