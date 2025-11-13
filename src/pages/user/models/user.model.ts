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

export interface Message {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'system';
  fileMetadata?: {
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  };
  isFormatted: boolean;
  timestamp: string;
  self: boolean;
  senderId?: string | User;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Chat {
  _id: string;
  name: string;
  isGroup: boolean;
  members: Member[];
  lastMessage?: LastMessage;
  hasUnread?: boolean;
}

export interface LastMessage {
  content?: string;
  timestamp?: string;
  type?: string;
  senderId?: string;
  createdAt?: string;
  sender?: Member;
}

export interface GroupChat extends Chat {
  admin?: Member;
  createdAt?: string;
  updatedAt?: string;
}

export enum ModalMessage {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface UploadResponse {
  success: boolean,
  messsage: Message
}




