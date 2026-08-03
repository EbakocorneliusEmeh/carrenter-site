import { api, unwrapApiData } from "@/lib/axios";

export interface RecentReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
}

export interface DealerAnalytics {
  totalVehicles: number;
  activeBookings: number;
  totalRevenue: number;
  recentReviews: RecentReview[];
}

export interface MonthlyRevenueChart {
  labels: string[];
  values: number[];
}

export async function getDealerAnalytics(): Promise<DealerAnalytics> {
  const response = await api.get("/api/v1/analytics/dealer");
  return unwrapApiData<DealerAnalytics>(response.data);
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenueChart> {
  const response = await api.get("/api/v1/analytics/dealer/revenue-chart");
  return unwrapApiData<MonthlyRevenueChart>(response.data);
}
