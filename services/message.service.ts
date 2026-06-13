import { apiClient } from "./api-client";
import type { DirectMessage, ChatPartner } from "@/types";

export const messageService = {
  async getChatPartners(token: string): Promise<ChatPartner[]> {
    return apiClient<ChatPartner[]>("/messages/partners", {
      method: "GET",
      token,
    });
  },

  async getDirectMessages(partnerId: string, token: string): Promise<DirectMessage[]> {
    return apiClient<DirectMessage[]>(`/messages?partnerId=${partnerId}`, {
      method: "GET",
      token,
    });
  },

  async sendDirectMessage(recipientId: string, content: string, token: string): Promise<DirectMessage> {
    return apiClient<DirectMessage>("/messages", {
      method: "POST",
      body: { recipientId, content },
      token,
    });
  },

  async getUnreadCounts(
    lastCommunitySeen: string | null,
    token: string
  ): Promise<{ unreadDMsCount: number; unreadCommunityCount: number }> {
    const url = lastCommunitySeen
      ? `/messages/unread?lastCommunitySeen=${encodeURIComponent(lastCommunitySeen)}`
      : "/messages/unread";
    return apiClient<{ unreadDMsCount: number; unreadCommunityCount: number }>(url, {
      method: "GET",
      token,
    });
  },
};

