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
};
