export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export interface ChatPartner {
  id: string;
  name: string;
  role: string;
  unreadCount?: number;
}
