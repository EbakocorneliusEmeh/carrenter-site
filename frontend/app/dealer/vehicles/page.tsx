"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listVehicles } from "@/services/vehicles.service";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className={styles.container}>Loading vehicles...</div>;
  }

  return (
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
                    ? `$${vehicle.dailyRentalPrice}/day `
                    : ""}
                  {vehicle.listingType === ListingType.SALE || vehicle.listingType === ListingType.BOTH
                    ? `$${vehicle.salePrice} (Buy)`
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
