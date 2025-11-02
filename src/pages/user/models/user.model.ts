export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  recipientId?: string; 
  roomId?: string; 
  message: string;
  timestamp: Date;
  isRead?: boolean;
  type: 'private' | 'group';
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}   