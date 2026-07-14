"use client";

import styles from "./page.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function DealerDashboard() {
  const { user } = useAuth();

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Vehicles</h1>
          <p className={styles.subtitle}>
            Manage your fleet, view bookings, and add new cars to your inventory.
          </p>
        </div>
        <button className={styles.primaryBtn}>+ Add Vehicle</button>
      </header>

      <section className={styles.section}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Vehicles</h3>
            <p className={styles.statValue}>0</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active Bookings</h3>
            <p className={styles.statValue}>0</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>$0.00</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🚗</div>
          <h2>No vehicles listed yet</h2>
          <p>Start adding vehicles to your inventory to get bookings.</p>
          <button className={styles.primaryBtn}>+ Add your first vehicle</button>
        </div>
      </section>
    </div>
  );
}
