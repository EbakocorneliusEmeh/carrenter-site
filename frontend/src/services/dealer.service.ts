import type {
  CreateDealerPagePayload,
  DealerPage,
  UpdateDealerPagePayload,
} from "@/types/auth.types";
import { api, unwrapApiData } from "@/services/axios";

export async function createDealerPage(payload: CreateDealerPagePayload) {
  const response = await api.post("/api/v1/dealer/pages", payload);
  return unwrapApiData<DealerPage>(response.data);
}

export async function listDealerPages() {
  const response = await api.get("/api/v1/dealer/pages");
  return unwrapApiData<DealerPage[]>(response.data);
}

export async function getDealerPage(id: string) {
  const response = await api.get(`/api/v1/dealer/pages/${id}`);
  return unwrapApiData<DealerPage>(response.data);
}

export async function updateDealerPage(id: string, payload: UpdateDealerPagePayload) {
  const response = await api.put(`/api/v1/dealer/pages/${id}`, payload);
  return unwrapApiData<DealerPage>(response.data);
}

export async function deleteDealerPage(id: string) {
  const response = await api.delete(`/api/v1/dealer/pages/${id}`);
  return unwrapApiData<{ success: boolean }>(response.data);
}
