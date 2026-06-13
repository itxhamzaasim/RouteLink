import { apiClient } from "./api-client";
import type { Notification } from "@/types";

export const notificationService = {
  async getNotifications(token: string): Promise<Notification[]> {
    return apiClient<Notification[]>("/notifications", {
      method: "GET",
      token,
    });
  },

  async markAsRead(id: string, token: string): Promise<Notification> {
    return apiClient<Notification>(`/notifications/${id}/read`, {
      method: "PATCH",
      token,
    });
  },
};
