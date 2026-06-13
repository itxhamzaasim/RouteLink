import { apiClient } from "./api-client";
import type { CommunityMessage, CommunityPost, CommunityComment } from "@/types";

export const communityService = {
  // Legacy chat messages
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

  // Redesigned forum posts
  async getPosts(token: string): Promise<CommunityPost[]> {
    return apiClient<CommunityPost[]>("/community/posts", {
      method: "GET",
      token,
    });
  },

  async createPost(
    postData: { title: string; content: string; category: "discussion" | "announcement" },
    token: string
  ): Promise<CommunityPost> {
    return apiClient<CommunityPost>("/community/posts", {
      method: "POST",
      body: postData,
      token,
    });
  },

  async deletePost(id: string, token: string): Promise<void> {
    return apiClient<void>(`/community/posts/${id}`, {
      method: "DELETE",
      token,
    });
  },

  // Discussion comments
  async getComments(postId: string, token: string): Promise<CommunityComment[]> {
    return apiClient<CommunityComment[]>(`/community/comments?postId=${postId}`, {
      method: "GET",
      token,
    });
  },

  async createComment(
    commentData: { postId: string; content: string },
    token: string
  ): Promise<CommunityComment> {
    return apiClient<CommunityComment>("/community/comments", {
      method: "POST",
      body: commentData,
      token,
    });
  },

  async deleteComment(id: string, token: string): Promise<void> {
    return apiClient<void>(`/community/comments/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
