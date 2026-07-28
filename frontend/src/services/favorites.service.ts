import { api, unwrapApiData } from "@/lib/axios";

export const toggleFavorite = async (vehicleId: string) => {
  const response = await api.post(`/api/v1/favorites/${vehicleId}`);
  return unwrapApiData<{ favorited: boolean }>(response.data);
};

export const getUserFavorites = async () => {
  const response = await api.get('/api/v1/favorites');
  return unwrapApiData<any[]>(response.data);
};
