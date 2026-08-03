import { api, unwrapApiData } from "@/lib/axios";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get("/api/v1/notifications");
  return unwrapApiData<Notification[]>(response.data);
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get("/api/v1/notifications/unread-count");
  const result = unwrapApiData<{ count: number }>(response.data);
  return result?.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/api/v1/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/api/v1/notifications/read-all");
}
