"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listDealerBookings, updateBookingStatus, type Booking } from "@/services/booking.service";
import styles from "./page.module.css";
import Image from "next/image";

export default function DealerBookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    loadBookings();
  }, [authLoading]);

  const loadBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listDealerBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: "APPROVED" | "REJECTED" | "COMPLETED") => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Update local state instantly for better UX
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update booking status");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading bookings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorScreen}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadBookings} className={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings & Inquiries</h1>
          <p className={styles.subtitle}>Manage your incoming customer requests.</p>
        </div>
      </header>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📬</div>
          <h3>No bookings yet</h3>
          <p>When customers request to rent or enquire about your vehicles, they will appear here.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((booking) => {
            const vehicle = booking.vehicle;
            const thumb = vehicle?.images?.[0]?.url;
            const isRent = !!booking.startDate && !!booking.endDate;

            return (
              <div key={booking.id} className={styles.bookingCard}>
                
                {/* Vehicle Thumbnail */}
                {thumb && (
                  <div className={styles.thumbWrapper}>
                    <img src={thumb} alt={vehicle?.name || "Vehicle"} className={styles.thumb} />
                  </div>
                )}

                {/* Booking Details */}
                <div className={styles.details}>
                  <div className={styles.headerRow}>
                    <h3 className={styles.vehicleName}>
                      {vehicle?.name || "Unknown Vehicle"}
                    </h3>
                    <span className={styles.statusBadge} data-status={booking.status}>
                      {booking.status}
                    </span>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Type</span>
                      <span className={styles.metaValue}>{isRent ? "Rental Request" : "Sale Inquiry"}</span>
                    </div>

                    {isRent && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Dates</span>
                        <span className={styles.metaValue}>
                          {booking.startDate} → {booking.endDate}
                        </span>
                      </div>
                    )}

                    {booking.totalPrice !== null && (
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Est. Total</span>
                        <span className={styles.metaValuePrice}>
                          {booking.totalPrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Date Requested</span>
                      <span className={styles.metaValue}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className={styles.messageBox}>
                      <strong>Message from customer:</strong>
                      <p>{booking.message}</p>
                    </div>
                  )}

                  {booking.customer && (
                    <div className={styles.customerBox}>
                      <h4 className={styles.customerBoxTitle}>Customer Details</h4>
                      <p><strong>Name:</strong> {booking.customer.fullName}</p>
                      <div className={styles.customerActions}>
                        {booking.customer.phone && (
                          <a href={`whatsapp://send?phone=${booking.customer.phone.replace(/\D/g, '')}`} className={styles.actionBtn}>
                            💬 WhatsApp
                          </a>
                        )}
                        {booking.customer.email && (
                          <a href={`mailto:${booking.customer.email}`} className={styles.actionBtn}>
                            ✉️ Email
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {booking.status === "PENDING" && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleUpdateStatus(booking.id, "APPROVED")}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleUpdateStatus(booking.id, "REJECTED")}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                {booking.status === "APPROVED" && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.completeBtn}
                      onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}
                    >
                      🏁 Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
