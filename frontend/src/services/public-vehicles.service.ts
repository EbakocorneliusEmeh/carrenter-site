import { api, unwrapApiData } from "@/lib/axios";
import type { Vehicle } from "@/types/vehicle.types";

export async function listPublicVehicles() {
  const response = await api.get("/api/v1/vehicles");
  return unwrapApiData<Vehicle[]>(response.data);
}
