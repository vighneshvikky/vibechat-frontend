// chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../service/user.service';

import { Subscription } from 'rxjs';
import { SocketService } from './service/web-socket-chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from './service/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  messageContent: string = '';
  currentUser: any;
  availableUsers: any[] = [];
  messages: any[] = [];
  chats: any[] = []; // Store all chats

  selectedChat: any = null;
  showCreateChat: boolean = false;
  newChatType: 'private' | 'group' = 'private';
  selectedUsers: string[] = [];
  groupChatName: string = '';
  isLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private chatService: ChatService
  ) {}

  // chat.component.ts
ngOnInit(): void {
  // Get current user first
  this.userService.getCurrentUser().subscribe({
    next: (user) => {
      this.currentUser = user;
      console.log('👤 Current user loaded:', user._id);

      // Connect socket with userId
      this.socketService.connect(user._id);

      // Subscribe to new messages
      this.subscriptions.push(
        this.socketService.newMessage$.subscribe((msg: any) => {
          console.log('📥 NEW MESSAGE EVENT:', msg);
          console.log('📍 Current chat:', this.selectedChat?._id);
          console.log('📍 Message chat:', msg.chatId);

          if (this.selectedChat && msg.chatId === this.selectedChat._id) {
            const senderIdValue =
              typeof msg.senderId === 'object'
                ? msg.senderId._id
                : msg.senderId;

            const newMessage = {
              ...msg,
              self: senderIdValue === this.currentUser._id,
            };

            console.log('✅ Adding message to UI:', newMessage);
            this.messages.push(newMessage);
          } else {
            console.log('⏭️ Message for different chat, skipping');
          }

          this.loadChats();
        })
      );

      // Subscribe to typing events
      this.subscriptions.push(
        this.socketService.userTyping$.subscribe((data: any) => {
          console.log('⌨️ User typing:', data);
        })
      );

      // Subscribe to message errors
      this.subscriptions.push(
        this.socketService.messageError$.subscribe((error: any) => {
          console.error('❌ Message error:', error);
          alert('Failed to send message: ' + error.message);
        })
      );

      // ✅ Subscribe to group created (for creator)
      this.subscriptions.push(
        this.socketService.groupCreated$.subscribe((data: any) => {
          console.log('✅ Group created successfully:', data);
          const group = data.group;
          
          // Select the newly created group
          this.selectedChat = group;
          this.messages = [];
          
          // Join the room via socket
          this.socketService.joinRoom(group._id, this.currentUser._id);
          
          // Close modal and reset loading
          this.showCreateChat = false;
          this.isLoading = false;
          
          // Reload chats list
          this.loadChats();
        })
      );

      // ✅ Subscribe to new group notifications (for other members)
      this.subscriptions.push(
        this.socketService.newGroup$.subscribe((group: any) => {
          console.log('👥 New group notification:', group);
          // Reload chats to show new group
          this.loadChats();
        })
      );

      // ✅ Subscribe to added to group
      this.subscriptions.push(
        this.socketService.addedToGroup$.subscribe((group: any) => {
          console.log('➕ Added to group:', group);
          this.loadChats();
        })
      );

      // Load users and chats
      this.loadUsers();
      this.loadChats();
    },
    error: (error) => {
      console.error('Error loading current user:', error);
    },
  });
}
  loadUsers(): void {
    this.userService.listAllUser().subscribe({
      next: (users) => {
        this.availableUsers = users.filter(
          (u) => u._id !== this.currentUser?._id
        );
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  loadChats(): void {
    if (!this.currentUser) return;

    this.chatService.getUserChats(this.currentUser._id).subscribe({
      next: (chats) => {
        this.chats = chats;
        console.log('chats', chats);
      },
      error: (error) => {
        console.error('Error loading chats:', error);
      },
    });
  }

  selectPrivateChat(user: any) {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Create or get existing private chat
    this.chatService
      .createPrivateChat(this.currentUser._id, user._id)
      .subscribe({
        next: (chat) => {
          this.selectedChat = chat;
          this.messages = [];

          // Join the room via socket
          this.socketService.joinRoom(chat._id, this.currentUser._id);

          // Load messages for this chat
          this.loadMessages(chat._id);

          this.isLoading = false;
          this.showCreateChat = false;
        },
        error: (error) => {
          console.error('Error creating/getting private chat:', error);
          this.isLoading = false;
        },
      });
  }

createGroupChat() {
  if (!this.groupChatName || this.selectedUsers.length === 0) {
    alert('Please enter a group name and select at least one member');
    return;
  }

  this.isLoading = true;

  // Include the current user (creator) in the participants
  const allParticipants = [this.currentUser._id, ...this.selectedUsers];

  // Use WebSocket to create group in real-time
  this.socketService.createGroup(
    this.groupChatName,
    allParticipants,
    this.currentUser._id
  );

  // Clear form immediately (we'll handle success via socket event)
  this.groupChatName = '';
  this.selectedUsers = [];
}

  selectExistingChat(chat: any) {
    this.selectedChat = chat;
    this.messages = [];

    // Join the room via socket
    this.socketService.joinRoom(chat._id, this.currentUser._id);

    // Load messages
    console.log('chat', chat);
    this.loadMessages(chat._id);
  }

  loadMessages(chatId: string) {
    console.log('chatId', chatId);
    this.chatService.getChatMessages(chatId).subscribe({
      next: (res) => {
        // Map messages and add 'self' property
        this.messages = res.map((msg: any) => ({
          ...msg,
          self: msg.senderId._id === this.currentUser._id, // Compare with senderId._id
        }));
        console.log('Loaded messages:', this.messages);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      },
    });
  }

  // chat.component.ts
  sendMessage() {
    if (!this.messageContent.trim() || !this.selectedChat) {
      console.log('❌ Cannot send: empty message or no chat selected');
      return;
    }

    const messageData = {
      chatId: this.selectedChat._id,
      senderId: this.currentUser._id,
      content: this.messageContent.trim(),
      type: 'text',
    };

    console.log('📤 SENDING MESSAGE:', messageData);

    // Send via socket
    this.socketService.sendMessage(
      messageData.chatId,
      messageData.senderId,
      messageData.content
    );

    // Clear input immediately
    this.messageContent = '';
  }

  toggleUserSelection(userId: string) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      if (this.newChatType === 'private') {
        this.selectedUsers = [userId];
      } else {
        this.selectedUsers.push(userId);
      }
    }
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }

  // Helper method for modal create button
  handleCreateChat() {
    if (this.newChatType === 'group') {
      this.createGroupChat();
    } else {
      // For private chat, find the selected user and create chat
      const selectedUser = this.availableUsers.find(
        (u) => u._id === this.selectedUsers[0]
      );
      if (selectedUser) {
        this.selectPrivateChat(selectedUser);
      }
    }
  }

  // Check if create button should be disabled
  isCreateDisabled(): boolean {
    if (this.isLoading) return true;
    if (this.selectedUsers.length === 0) return true;
    if (this.newChatType === 'group' && !this.groupChatName) return true;
    return false;
  }

  getChatDisplayName(chat: any): string {
    if (chat.isGroup) {
      return chat.name;
    }

    // For private chats, show the other user's name
    const otherUser = chat.members?.find(
      (m: any) => m._id !== this.currentUser._id
    );
    return otherUser?.name || 'Unknown User';
  }

  getChatAvatar(chat: any): string {
    if (chat.isGroup) {
      return chat.name?.charAt(0).toUpperCase() || 'G';
    }

    const otherUser = chat.members?.find(
      (m: any) => m._id !== this.currentUser._id
    );
    return otherUser?.name?.charAt(0).toUpperCase() || 'U';
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
