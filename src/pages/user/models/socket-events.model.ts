import { FileMetadata } from "../chat/service/web-socket-chat.service";
import { Chat, Member, LastMessage } from "./user.model";


export interface RoomJoinedData {
  chatId: string;
  userId: string;
  roomName?: string;
}

export interface UserJoinedData {
  chatId: string;
  userId: string;
  username: string;
}

export interface MessageSentData {
  messageId: string;
  chatId: string;
  timestamp: string;
}

export interface MessageError {
  message?: string; 
  error?: string;
  messageId?: string;
}


export interface GroupChat {
  _id: string;
  name: string;
  members: string[];
  createdBy: string;
  isGroup: boolean;
  group: Chat ;
}

export interface UserAddedToGroup {
  chatId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  group: Chat | null;
}

export interface UserRemovedFromGroup {
  chatId: string;
  isKicked: boolean;
  groupName: string;
  user: {
    _id: string;
    name: string;
  };
  group: {
     _id: string;
      name: string;
      isGroup: boolean;
      members: Member[];
      lastMessage?: LastMessage;
      hasUnread?: boolean;
  }
}

export interface PrivateChat {
chat: Chat
}
