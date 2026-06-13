import { apiClient } from "./api-client";
import type { CommunityMessage } from "@/types";

export const communityService = {
  async getMessages(token: string): Promise<CommunityMessage[]> {
    return apiClient<CommunityMessage[]>("/community", {
      method: "GET",
      token,
    });
  },

  async postMessage(content: string, token: string): Promise<CommunityMessage> {
    return apiClient<CommunityMessage>("/community", {
      method: "POST",
      body: { content },
      token,
    });
  },
};
