import { api, unwrapApiData } from "@/lib/axios";

export interface CreateBookingPayload {
  vehicleId: string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  message?: string;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  dealerId: string;
  startDate: string | null;
  endDate: string | null;
  totalPrice: number | null;
  message: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    dailyRentalPrice: number | null;
    salePrice: number | null;
    listingType: string;
    pickupLocation: string;
    images?: { id: string; url: string; position: number }[];
  } | null;
  dealer?: {
    id: string;
    businessName: string;
    slug?: string | null;
    contactPhone?: string | null;
    contactWhatsapp?: string | null;
    contactEmail?: string | null;
  } | null;
  customer?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const response = await api.post("/api/v1/bookings", payload);
  return unwrapApiData<Booking>(response.data);
}

export async function listCustomerBookings(): Promise<Booking[]> {
  const response = await api.get("/api/v1/bookings/customer");
  return unwrapApiData<Booking[]>(response.data);
}

export async function listDealerBookings(): Promise<Booking[]> {
  const response = await api.get("/api/v1/bookings/dealer");
  return unwrapApiData<Booking[]>(response.data);
}

export async function updateBookingStatus(
  bookingId: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED"
): Promise<Booking> {
  const response = await api.patch(`/api/v1/bookings/${bookingId}/status`, { status });
  return unwrapApiData<Booking>(response.data);
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  const response = await api.delete(`/api/v1/bookings/${bookingId}`);
  return unwrapApiData<Booking>(response.data);
}

export async function deleteBooking(bookingId: string): Promise<Booking> {
  const response = await api.delete(`/api/v1/bookings/${bookingId}/delete`);
  return unwrapApiData<Booking>(response.data);
}
