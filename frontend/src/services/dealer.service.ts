import type {
  CreateDealerPagePayload,
  DealerPage,
  UpdateDealerPagePayload,
} from "@/types/auth.types";
import { api, unwrapApiData } from "@/lib/axios";

export async function createDealerPage(payload: CreateDealerPagePayload | FormData) {
  const isFormData = payload instanceof FormData;
  const response = await api.post("/api/v1/dealer/pages", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
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

export async function getDealerPageBySlug(slug: string) {
  const response = await api.get(
    `/api/v1/dealer/pages/${encodeURIComponent(slug)}`,
  );
  return unwrapApiData<DealerPage>(response.data);
}

export async function updateDealerPage(id: string, payload: UpdateDealerPagePayload | FormData) {
  const isFormData = payload instanceof FormData;
  const response = await api.put(`/api/v1/dealer/pages/${id}`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return unwrapApiData<DealerPage>(response.data);
}

export async function deleteDealerPage(id: string) {
  const response = await api.delete(`/api/v1/dealer/pages/${id}`);
  return unwrapApiData<{ success: boolean }>(response.data);
}
