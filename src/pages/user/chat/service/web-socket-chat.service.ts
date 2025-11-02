// web-socket-chat.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  public isConnected$ = new BehaviorSubject<boolean>(false);
  private currentUserId: string = '';

  // Subjects for real-time events
  private newMessageSubject = new Subject<any>();
  private userTypingSubject = new Subject<any>();
  private roomJoinedSubject = new Subject<any>();
  private userJoinedSubject = new Subject<any>();
  private messageSentSubject = new Subject<any>();
  private messageErrorSubject = new Subject<any>();

  // Group subjects
  private newGroupSubject = new Subject<any>();
  private groupCreatedSubject = new Subject<any>();
  private addedToGroupSubject = new Subject<any>();
  private userAddedToGroupSubject = new Subject<any>();
  private userRemovedFromGroupSubject = new Subject<any>();

  // Private chat subjects
  private privateChatCreatedSubject = new Subject<any>();

  // Observables
  public newMessage$ = this.newMessageSubject.asObservable();
  public userTyping$ = this.userTypingSubject.asObservable();
  public roomJoined$ = this.roomJoinedSubject.asObservable();
  public userJoined$ = this.userJoinedSubject.asObservable();
  public messageSent$ = this.messageSentSubject.asObservable();
  public messageError$ = this.messageErrorSubject.asObservable();

  public newGroup$ = this.newGroupSubject.asObservable();
  public groupCreated$ = this.groupCreatedSubject.asObservable();
  public addedToGroup$ = this.addedToGroupSubject.asObservable();
  public userAddedToGroup$ = this.userAddedToGroupSubject.asObservable();
  public userRemovedFromGroup$ = this.userRemovedFromGroupSubject.asObservable();

  public privateChatCreated$ = this.privateChatCreatedSubject.asObservable();

  constructor() {}

  connect(userId?: string) {
    if (this.socket && this.socket.connected) {
      console.log('⚠️ Socket already connected');
      return;
    }

    if (userId) {
      this.currentUserId = userId;
    }

    console.log('🔌 Connecting socket with userId:', userId);

    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      query: userId ? { userId } : {},
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server:', this.socket.id);
      this.isConnected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
      this.isConnected$.next(false);
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('roomJoined', (data: any) => {
      console.log('🚪 Joined room:', data);
      this.roomJoinedSubject.next(data);
    });

    this.socket.on('userJoined', (data: any) => {
      console.log('👤 User joined:', data);
      this.userJoinedSubject.next(data);
    });

    this.socket.on('userLeft', (data: any) => {
      console.log('👋 User left:', data);
    });

    this.socket.on('messageSent', (data: any) => {
      console.log('✅ Message sent confirmation:', data);
      this.messageSentSubject.next(data);
    });

    this.socket.on('messageError', (error: any) => {
      console.error('❌ Message error:', error);
      this.messageErrorSubject.next(error);
    });

    this.socket.on('newMessage', (message: any) => {
      console.log('📥 NEW MESSAGE RECEIVED FROM SERVER:', message);
      this.newMessageSubject.next(message);
    });

    this.socket.on('userTyping', (data: any) => {
      console.log('⌨️ User typing:', data);
      this.userTypingSubject.next(data);
    });

    // Group events
    this.socket.on('newGroup', (group: any) => {
      console.log('👥 New group received:', group);
      this.newGroupSubject.next(group);
    });

    this.socket.on('groupCreated', (data: any) => {
      console.log('✅ Group created confirmation:', data);
      this.groupCreatedSubject.next(data);
    });

    this.socket.on('addedToGroup', (group: any) => {
      console.log('➕ Added to group:', group);
      this.addedToGroupSubject.next(group);
    });

    this.socket.on('userAddedToGroup', (data: any) => {
      console.log('👤 User added to group:', data);
      this.userAddedToGroupSubject.next(data);
    });

    this.socket.on('userRemovedFromGroup', (data: any) => {
      console.log('👤 User removed from group:', data);
      this.userRemovedFromGroupSubject.next(data);
    });

    this.socket.on('groupError', (error: any) => {
      console.error('❌ Group error:', error);
    });

    // Private chat events
    this.socket.on('privateChatCreated', (data: any) => {
      console.log('💬 Private chat created:', data);
      this.privateChatCreatedSubject.next(data);
    });

    console.log('✅ All socket event listeners set up');
  }

  joinRoom(chatId: string, userId: string) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    console.log('📤 Joining room:', { chatId, userId });
    this.socket.emit('joinRoom', { chatId, userId });
  }

  leaveRoom(chatId: string, userId: string) {
    if (!this.socket) return;

    console.log('📤 Leaving room:', { chatId, userId });
    this.socket.emit('leaveRoom', { chatId, userId });
  }

  sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    fileMetadata?: any
  ) {
    if (!this.socket) {
      console.error('❌ Socket not connected!');
      return;
    }

    if (!this.socket.connected) {
      console.error('❌ Socket exists but not connected!');
      return;
    }

    const messageData = {
      chatId,
      senderId,
      content,
      type,
      fileMetadata,
    };

    console.log('📤 Socket.emit sendMessage:', messageData);
    this.socket.emit('sendMessage', messageData);
    console.log('✅ Message emitted to server');
  }

  // Create private chat via WebSocket
  createPrivateChat(userId1: string, userId2: string) {
    if (!this.socket) {
      console.error('❌ Socket not connected!');
      return;
    }

    console.log('💬 Creating private chat:', { userId1, userId2 });
    this.socket.emit('createPrivateChat', { userId1, userId2 });
  }

  createGroup(name: string, participants: string[], createdBy: string) {
    if (!this.socket) return;
    
    this.socket.emit('createGroup', { name, participants, createdBy });
  }

  addUserToGroup(chatId: string, userId: string, addedBy: string) {
    if (!this.socket) return;
    
    this.socket.emit('addUserToGroup', { chatId, userId, addedBy });
  }

  removeUserFromGroup(chatId: string, userId: string, removedBy: string) {
    if (!this.socket) return;
    
    this.socket.emit('removeUserFromGroup', { chatId, userId, removedBy });
  }

  emitTyping(chatId: string, userId: string, username: string) {
    if (!this.socket) return;

    this.socket.emit('typing', {
      chatId,
      userId,
      username,
      isTyping: true,
    });
  }

  emitStopTyping(chatId: string, userId: string, username: string) {
    if (!this.socket) return;

    this.socket.emit('typing', {
      chatId,
      userId,
      username,
      isTyping: false,
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.isConnected$.next(false);
    }
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}