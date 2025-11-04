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
    }, {withCredentials: true});
  }

  // Create group chat
  createGroupChat(name: string, members: string[], userId: string): Observable<any> {
    console.log('hai from creating group')
    return this.http.post(`${this.apiUrl}/group`, {
      name,
      members,
      userId
    }, {withCredentials: true});
  }

  // Get all chats for user
  getUserChats(userId: string, search: string): Observable<any[]> {
   let url = `${this.apiUrl}?userId=${userId}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return this.http.get<any[]>(url, {withCredentials: true});
  }

       getChatMessages(chatId: string): Observable<any> {
        console.log('loading chate ee message');
    return this.http.get<any>(`${this.apiUrl}/getChatMessages/${chatId}`, {withCredentials: true});
  }

  // Get single chat
  getChat(chatId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${chatId}`, {withCredentials: true});
  }

  // Join group chat
  joinChat(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${chatId}/join`, { userId }, {withCredentials: true});
  }

  // Leave group chat
  leaveChat(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${chatId}/leave`, { userId }, {withCredentials: true});
  }

  // Delete chat
  deleteChat(chatId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${chatId}`, {withCredentials: true});
  }

   uploadFile(file: File, chatId: string, senderId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);
    formData.append('senderId', senderId);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, {withCredentials: true});
  }

  // Helper to get file URL
  getFileUrl(fileName: string): string {
    return `${environment.apiUrl}/uploads/chat-files/${fileName}`;
  }

  // Helper to determine if file is image
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  // Helper to get file icon
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}