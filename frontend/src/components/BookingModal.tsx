"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/types/vehicle.types";
import { ListingType } from "@/types/vehicle.types";
import { createBooking } from "@/services/booking.service";
import styles from "./BookingModal.module.css";

interface BookingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function BookingModal({ vehicle, onClose }: BookingModalProps) {
  const isRent =
    vehicle.listingType === ListingType.RENT ||
    vehicle.listingType === ListingType.BOTH;
  const isSale =
    vehicle.listingType === ListingType.SALE ||
    vehicle.listingType === ListingType.BOTH;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Calculate number of days and total price
  const numDays =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const totalPrice =
    isRent && vehicle.dailyRentalPrice && numDays > 0
      ? vehicle.dailyRentalPrice * numDays
      : null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRent && (!startDate || !endDate)) {
      setError("Please select your rental start and end dates.");
      return;
    }
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createBooking({
        vehicleId: vehicle.id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        totalPrice: totalPrice ?? undefined,
        message: message || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to submit booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const thumbnail =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0].url
      : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            {thumbnail && (
              <img
                src={thumbnail}
                alt={vehicle.name}
                className={styles.headerThumb}
              />
            )}
            <div>
              <h2 className={styles.headerTitle}>
                {isSale && !isRent ? "Enquire About" : "Rent"} This Vehicle
              </h2>
              <p className={styles.headerSub}>
                {vehicle.year} {vehicle.brand} {vehicle.model}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className={styles.successState}>
            <div className={styles.successIcon}>🎉</div>
            <h3 className={styles.successTitle}>
              {isRent ? "Booking Sent!" : "Inquiry Sent!"}
            </h3>
            <p className={styles.successDesc}>
              {isRent
                ? "Your rental request has been sent to the dealer. They will review and confirm your booking shortly."
                : "Your enquiry has been sent to the dealer. They will get back to you shortly."}
            </p>
            <button className={styles.doneBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Rental Dates (only for rent/both) */}
            {isRent && (
              <div className={styles.datesRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="startDate">
                    📅 Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className={styles.input}
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    required={isRent}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="endDate">
                    📅 End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    className={styles.input}
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    required={isRent}
                  />
                </div>
              </div>
            )}

            {/* Price Preview */}
            {totalPrice !== null && (
              <div className={styles.pricePreview}>
                <div className={styles.priceRow}>
                  <span>{numDays} day{numDays !== 1 ? "s" : ""} × {vehicle.dailyRentalPrice?.toLocaleString()} FCFA</span>
                  <strong>{totalPrice.toLocaleString()} FCFA</strong>
                </div>
                <div className={styles.priceNote}>
                  Final price subject to dealer confirmation
                </div>
              </div>
            )}

            {/* Sale Price Info */}
            {isSale && vehicle.salePrice && (
              <div className={styles.salePriceBox}>
                <span className={styles.salePriceLabel}>Sale Price</span>
                <span className={styles.salePriceValue}>
                  {vehicle.salePrice.toLocaleString()} FCFA
                </span>
              </div>
            )}

            {/* Message */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="bookingMessage">
                💬 Message to Dealer{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="bookingMessage"
                className={styles.textarea}
                placeholder={
                  isRent
                    ? "Any special requests, questions, or pickup details…"
                    : "Tell the dealer what you need or any questions you have…"
                }
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Pickup Info */}
            <div className={styles.pickupInfo}>
              <span>📍</span>
              <span>
                <strong>Pickup:</strong> {vehicle.pickupLocation}
              </span>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Sending…"
                : isRent
                ? "🚗 Confirm Booking Request"
                : "✉️ Send Enquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
