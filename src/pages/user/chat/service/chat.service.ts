
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Chat, Message, UploadResponse } from '../../models/user.model';
import { API_ROUTES } from '../../../../app/app.routes.constant';

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
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}${API_ROUTES.CHAT.BASE}`;
  

  constructor(private http: HttpClient) {}


  createPrivateChat(userId: string, participantId: string): Observable<Chat> {
    return this.http.post<Chat>(
      `${this.apiUrl}${API_ROUTES.CHAT.PRIVATE}`,
      {
        userId,
        participantId,
      },
      { withCredentials: true }
    );
  }


  createGroupChat(
    name: string,
    members: string[],
    userId: string
  ): Observable<Chat> {
   
    return this.http.post<Chat>(
      `${this.apiUrl}${API_ROUTES.CHAT.GROUP}`,
      {
        name,
        members,
        userId,
      },
      { withCredentials: true }
    );
  }


  getUserChats(userId: string, search: string): Observable<Chat[]> {
    let url = `${this.apiUrl}?userId=${userId}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<Chat[]>(url, { withCredentials: true });
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    console.log('loading chate ee message');
    return this.http.get<Message[]>(
      `${this.apiUrl}${API_ROUTES.CHAT.GET_MESSAGES(chatId)}`,
      { withCredentials: true }
    );
  }


  getChat(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}${API_ROUTES.CHAT.GET_CHAT(chatId)}`, {
      withCredentials: true,
    });
  }

 
  joinChat(chatId: string, userId: string): Observable<Chat> {
    return this.http.post<Chat>(
      `${this.apiUrl}${API_ROUTES.CHAT.JOIN(chatId)}`,
      { userId },
      { withCredentials: true }
    );
  }

 
  leaveChat(chatId: string, userId: string): Observable<Chat> {
    return this.http.post<Chat>(
      `${this.apiUrl}${API_ROUTES.CHAT.LEAVE(chatId)}`,
      { userId },
      { withCredentials: true }
    );
  }

  uploadFile(
    file: File,
    chatId: string,
    senderId: string
  ): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);
    formData.append('senderId', senderId);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, {
      withCredentials: true,
    });
  }

  getFileUrl(fileName: string): string {
    return `${environment.apiUrl}${API_ROUTES.CHAT.UPLOAD}/chat-files/${fileName}`;
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
      return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
