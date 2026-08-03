import { api, unwrapApiData } from "@/lib/axios";

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export async function createReview(payload: { bookingId: string; rating: number; comment?: string }) {
  const response = await api.post("/api/v1/reviews", payload);
  return unwrapApiData<any>(response.data);
}

export async function getVehicleReviews(vehicleId: string) {
  const response = await api.get(`/api/v1/reviews/vehicle/${vehicleId}`);
  return unwrapApiData<ReviewSummary>(response.data);
}

export async function getBookingReviewStatus(bookingId: string) {
  const response = await api.get(`/api/v1/reviews/booking/${bookingId}/status`);
  return unwrapApiData<{ reviewed: boolean }>(response.data);
}
