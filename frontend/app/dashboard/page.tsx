"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listDealerPages } from "@/services/dealer.service";
import { listPublicVehicles } from "@/services/public-vehicles.service";
import type { DealerPage } from "@/types/auth.types";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import styles from "./page.module.css";

export default function MainDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [pages, setPages] = useState<DealerPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

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
    if (authLoading) return;
    listPublicVehicles()
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoading(false));
  }, [authLoading]);

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
    if (vehicle.listingType === ListingType.RENT) return `$${vehicle.dailyRentalPrice}/day`;
    if (vehicle.listingType === ListingType.SALE) return `$${vehicle.salePrice}`;
    return `$${vehicle.dailyRentalPrice}/day · $${vehicle.salePrice} (Buy)`;
  }

  function getBadgeClass(type: ListingType) {
    if (type === ListingType.RENT) return styles.badgeRent;
    if (type === ListingType.SALE) return styles.badgeSale;
    return styles.badgeBoth;
  }

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className={styles.title}>
            Welcome back, {user?.fullName || "there"}!
          </h1>
          <p className={styles.subtitle}>{user?.email}</p>
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
            <span className={styles.ctaIcon}>💼</span>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Become a Business Owner</h2>
              <p className={styles.ctaDesc}>
                Ready to list your vehicles and grow your rental business? Upgrade your account to get started today.
              </p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryBtn} href="/customer/dashboard?section=business">
                Create Your Business Page
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Available Vehicles */}
      <section className={styles.vehiclesSection}>
        <div className={styles.vehiclesSectionHeader}>
          <h2 className={styles.sectionTitle}>🚗 Available Vehicles</h2>
        </div>

        {vehiclesLoading ? (
          <p className={styles.vehiclesLoading}>Loading vehicles…</p>
        ) : vehicles.length === 0 ? (
          <div className={styles.emptyVehicles}>
            <p>No vehicles listed yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.vehiclesGrid}>
            {vehicles.map((vehicle) => (
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
                  <a href="#" className={styles.vehicleCardBtn}>
                    {vehicle.listingType === ListingType.SALE ? "Enquire" : "Rent Now"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
