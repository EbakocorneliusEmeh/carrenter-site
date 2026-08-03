"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import styles from "./page.module.css";
import { getDealerAnalytics, getMonthlyRevenue, type DealerAnalytics, type MonthlyRevenueChart } from "@/services/analytics.service";
import RevenueChart from "@/components/RevenueChart";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

export default function DealerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<DealerAnalytics | null>(null);
  const [chartData, setChartData] = useState<MonthlyRevenueChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  // Only set clock client-side to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Wait for auth to be ready before making API calls
  useEffect(() => {
    if (authLoading) return;
    getDealerAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
    getMonthlyRevenue()
      .then(setChartData)
      .catch(console.error);
  }, [authLoading]);

  const avgRating =
    analytics && analytics.recentReviews.length > 0
      ? (
          analytics.recentReviews.reduce((s, r) => s + r.rating, 0) /
          analytics.recentReviews.length
        ).toFixed(1)
      : null;

  return (
    <>
      <header className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Performance Dashboard</h1>
            <p className={styles.pageSubtitle}>Real-time overview of your fleet and revenue</p>
          </div>
          <div className={styles.dateBadge}>
            <div className={styles.dateBadgeDate}>
              {now ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
            </div>
            <div className={styles.dateBadgeTime}>
              {now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
            </div>
          </div>
        </header>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading your analytics…</p>
          </div>
        ) : analytics ? (
          <>
            {/* Stats grid */}
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statBlue}`}>
                <div className={styles.statIconWrap}>🚗</div>
                <div className={styles.statBody}>
                  <div className={styles.statLabel}>Total Vehicles</div>
                  <div className={styles.statValue}>{analytics.totalVehicles}</div>
                  <div className={styles.statHint}>Listed in your inventory</div>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statAmber}`}>
                <div className={styles.statIconWrap}>📋</div>
                <div className={styles.statBody}>
                  <div className={styles.statLabel}>Active Bookings</div>
                  <div className={styles.statValue}>{analytics.activeBookings}</div>
                  <div className={styles.statHint}>Pending &amp; approved</div>
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.statGreen}`}>
                <div className={styles.statIconWrap}>💰</div>
                <div className={styles.statBody}>
                  <div className={styles.statLabel}>Total Revenue</div>
                  <div className={styles.statValue}>{analytics.totalRevenue.toLocaleString()}</div>
                  <div className={styles.statHint}>FCFA from completed rentals</div>
                </div>
              </div>
              {avgRating && (
                <div className={`${styles.statCard} ${styles.statPurple}`}>
                  <div className={styles.statIconWrap}>⭐</div>
                  <div className={styles.statBody}>
                    <div className={styles.statLabel}>Avg. Rating</div>
                    <div className={styles.statValue}>{avgRating} / 5</div>
                    <div className={styles.statHint}>Based on {analytics.recentReviews.length} recent review{analytics.recentReviews.length !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Chart */}
            {chartData && <RevenueChart data={chartData} />}

            {/* Quick actions */}
            <div className={styles.quickActions}>
              <Link href="/dealer/vehicles" className={styles.actionCard}>
                <span className={styles.actionIcon}>➕</span>
                <span>Add Vehicle</span>
              </Link>
              <Link href="/dealer/bookings" className={styles.actionCard}>
                <span className={styles.actionIcon}>📥</span>
                <span>View Requests</span>
              </Link>
              <Link href="/dealer/settings" className={styles.actionCard}>
                <span className={styles.actionIcon}>✏️</span>
                <span>Edit Business Page</span>
              </Link>
            </div>

            {/* Recent Reviews */}
            <section className={styles.reviewsSection}>
              <h2 className={styles.sectionTitle}>Recent Customer Reviews</h2>
              {analytics.recentReviews.length > 0 ? (
                <div className={styles.reviewsGrid}>
                  {analytics.recentReviews.map((rev) => (
                    <div key={rev.id} className={styles.reviewCard}>
                      <div className={styles.reviewCardTop}>
                        <div className={styles.reviewAvatar}>
                          {rev.reviewerName?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <div className={styles.reviewerName}>{rev.reviewerName}</div>
                          <div className={styles.reviewDate}>
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </div>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      {rev.comment && (
                        <p className={styles.reviewComment}>"{rev.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyReviews}>
                  <span className={styles.emptyEmoji}>⭐</span>
                  <h3>No reviews yet</h3>
                  <p>Complete rentals to start receiving customer feedback.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className={styles.errorState}>
            <span>⚠️</span>
            <p>Failed to load analytics. Please refresh the page.</p>
          </div>
        )}
      {/* End main content */}
    </>
  );
}
