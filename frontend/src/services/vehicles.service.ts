import { api, unwrapApiData } from "@/lib/axios";
import type { Vehicle, UpdateVehiclePayload } from "@/types/vehicle.types";

export async function createVehicle(payload: FormData) {
  const response = await api.post("/api/v1/dealer/vehicles", payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapApiData<Vehicle>(response.data);
}

export async function listVehicles() {
  const response = await api.get("/api/v1/dealer/vehicles");
  return unwrapApiData<Vehicle[]>(response.data);
}

export async function getVehicle(id: string) {
  const response = await api.get(`/api/v1/dealer/vehicles/${id}`);
  return unwrapApiData<Vehicle>(response.data);
}

export async function updateVehicle(id: string, payload: UpdateVehiclePayload) {
  const response = await api.put(`/api/v1/dealer/vehicles/${id}`, payload);
  return unwrapApiData<Vehicle>(response.data);
}

export async function deleteVehicle(id: string) {
  const response = await api.delete(`/api/v1/dealer/vehicles/${id}`);
  return unwrapApiData<{ success: boolean }>(response.data);
}
