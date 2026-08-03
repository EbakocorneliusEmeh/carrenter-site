import { useState } from "react";
import { createReview } from "@/services/reviews.service";
import styles from "./ReviewModal.module.css";

interface ReviewModalProps {
  bookingId: string;
  vehicleName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ bookingId, vehicleName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await createReview({ bookingId, rating, comment: comment.trim() || undefined });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>Rate Your Experience</h2>
        <p className={styles.subtitle}>How was your rental of the <strong>{vehicleName}</strong>?</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starActive : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="comment">Leave a Comment (Optional)</label>
            <textarea
              id="comment"
              className={styles.textarea}
              placeholder="Tell us about the vehicle and the dealer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
