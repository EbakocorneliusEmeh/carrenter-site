import type {
  CreateDealerPagePayload,
  DealerPage,
  PublicDealerPage,
  UpdateDealerPagePayload,
} from "@/types/auth.types";
import { api, unwrapApiData } from "@/lib/axios";

export async function createDealerPage(payload: FormData) {
  const response = await api.post("/api/v1/dealer/pages", payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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

export async function getPublicDealerPageBySlug(slug: string) {
  const response = await api.get(
    `/api/v1/public/pages/${encodeURIComponent(slug)}`,
  );
  return unwrapApiData<PublicDealerPage>(response.data);
}

export async function updateDealerPage(id: string, payload: FormData) {
  const response = await api.put(`/api/v1/dealer/pages/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapApiData<DealerPage>(response.data);
}

export async function deleteDealerPage(id: string) {
  const response = await api.delete(`/api/v1/dealer/pages/${id}`);
  return unwrapApiData<{ success: boolean }>(response.data);
}
