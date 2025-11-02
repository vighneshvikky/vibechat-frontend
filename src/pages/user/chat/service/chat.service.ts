// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface CreatePrivateChatDto {
  userId: string;
  participantId: string;
}

export interface CreateGroupChatDto {
  name: string;
  members: string[];
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) {}

  // Create private chat
  createPrivateChat(userId: string, participantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/private`, {
      userId,
      participantId
    });
  }

  // Create group chat
  createGroupChat(name: string, members: string[], userId: string): Observable<any> {
    console.log('hai from creating group')
    return this.http.post(`${this.apiUrl}/group`, {
      name,
      members,
      userId
    });
  }

  // Get all chats for user
  getUserChats(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`);
  }

       getChatMessages(chatId: string): Observable<any> {
        console.log('loading chate ee message');
    return this.http.get<any>(`${this.apiUrl}/getChatMessages/${chatId}`);
  }

  // Get single chat
  getChat(chatId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${chatId}`);
  }

  // Join group chat
  joinChat(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${chatId}/join`, { userId });
  }

  // Leave group chat
  leaveChat(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${chatId}/leave`, { userId });
  }

  // Delete chat
  deleteChat(chatId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${chatId}`);
  }
}