export interface MessageObject {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: unknown;
}

export interface GetMessagesResponse {
  messages: MessageObject[];
}
