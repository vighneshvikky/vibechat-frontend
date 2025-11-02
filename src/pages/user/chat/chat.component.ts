// chat.component.ts (Fixed version)
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs';
import { SocketService } from './service/web-socket-chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from './service/chat.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmojiPickerComponent } from '../emoji/emoji-picker.component';
import { MessageFormatterService } from './service/messageFormat.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [FormsModule, CommonModule, EmojiPickerComponent],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  messageContent: string = '';
  currentUser: any;
  availableUsers: any[] = [];
  messages: any[] = [];
  chats: any[] = [];

  selectedChat: any = null;
  showCreateChat: boolean = false;
  newChatType: 'private' | 'group' = 'private';
  selectedUsers: string[] = [];
  groupChatName: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';

  // Emoji picker
  showEmojiPicker: boolean = false;

  // File upload
  selectedFile: File | null = null;
  filePreview: string | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  showFormattingHelp: boolean = false;

  private isNearBottom = true;
  environmet = environment;

  private subscriptions: Subscription[] = [];

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private chatService: ChatService,
    private messageFormatter: MessageFormatterService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('👤 Current user loaded:', user._id);

        this.socketService.connect(user._id);

        // Subscribe to new messages
        this.subscriptions.push(
          this.socketService.newMessage$.subscribe((msg: any) => {
            console.log('📥 NEW MESSAGE EVENT:', msg);

            if (this.selectedChat && msg.chatId === this.selectedChat._id) {
              // Handle both sender and senderId fields
              const senderIdValue = this.getSenderId(msg);

              const newMessage = {
                ...msg,
                self: senderIdValue === this.currentUser._id,
              };

              console.log('✅ Adding message to UI:', newMessage);
              this.messages.push(newMessage);

              // Auto-scroll if user was near bottom or if it's their own message
              if (this.isNearBottom || newMessage.self) {
                this.scrollToBottom();
              }
            }

            this.loadChats();
          })
        );

        // Subscribe to private chat created
        this.subscriptions.push(
          this.socketService.privateChatCreated$.subscribe((data: any) => {
            console.log('💬 Private chat created successfully:', data);
            const chat = data.chat;

            this.selectedChat = chat;
            this.messages = [];
            this.socketService.joinRoom(chat._id, this.currentUser._id);
            this.showCreateChat = false;
            this.isLoading = false;
            this.loadChats();
            this.scrollToBottom();
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

        // Subscribe to group created
        this.subscriptions.push(
          this.socketService.groupCreated$.subscribe((data: any) => {
            console.log('✅ Group created successfully:', data);
            const group = data.group;

            this.selectedChat = group;
            this.messages = [];
            this.socketService.joinRoom(group._id, this.currentUser._id);
            this.showCreateChat = false;
            this.isLoading = false;
            this.loadChats();
          })
        );

        // Subscribe to new group notifications
        this.subscriptions.push(
          this.socketService.newGroup$.subscribe((group: any) => {
            console.log('👥 New group notification:', group);
            this.loadChats();
          })
        );

        // Subscribe to added to group
        this.subscriptions.push(
          this.socketService.addedToGroup$.subscribe((group: any) => {
            console.log('➕ Added to group:', group);
            this.loadChats();
          })
        );

        this.loadUsers();
        this.loadChats();
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      },
    });
  }

  // Helper method to get sender ID from message (handles both sender and senderId)
  private getSenderId(msg: any): string {
    if (msg.sender) {
      return typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    }
    if (msg.senderId) {
      return typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
    }
    return '';
  }

  onSearchChange(): void {
    this.loadChats();
  }

  ngAfterViewInit() {
    // Initial scroll setup
    if (this.messagesContainer) {
      console.log('✅ Messages container initialized');
    }
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (e.shiftKey) return;
    e.preventDefault();
    this.sendMessage();
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

    this.chatService.getUserChats(this.currentUser._id, this.searchTerm).subscribe({
      next: (chats) => {
        this.chats = chats;
      },
      error: (error) => {
        console.error('Error loading chats:', error);
      },
    });
  }

  selectPrivateChat(user: any) {
    if (!this.currentUser) return;

    this.isLoading = true;

    // Use WebSocket to create private chat in real-time
    this.socketService.createPrivateChat(this.currentUser._id, user._id);
  }

  createGroupChat() {
    if (!this.groupChatName || this.selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    this.isLoading = true;

    const allParticipants = [this.currentUser._id, ...this.selectedUsers];

    this.socketService.createGroup(
      this.groupChatName,
      allParticipants,
      this.currentUser._id
    );

    this.groupChatName = '';
    this.selectedUsers = [];
  }

  selectExistingChat(chat: any) {
    this.selectedChat = chat;
    this.messages = [];
    this.socketService.joinRoom(chat._id, this.currentUser._id);
    this.loadMessages(chat._id);
  }

  loadMessages(chatId: string) {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (res) => {
        // Handle both sender and senderId fields from API response
        this.messages = res.map((msg: any) => {
          const senderIdValue = this.getSenderId(msg);
          return {
            ...msg,
            self: senderIdValue === this.currentUser._id,
          };
        });
        console.log('Loaded messages:', this.messages);
        // Scroll to bottom after messages are loaded
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      },
    });
  }

  // Send text message
  sendMessage() {
    if (!this.messageContent.trim() || !this.selectedChat) {
      return;
    }

    const messageData = {
      chatId: this.selectedChat._id,
      senderId: this.currentUser._id,
      content: this.messageContent.trim(),
      type: 'text',
    };

    this.socketService.sendMessage(
      messageData.chatId,
      messageData.senderId,
      messageData.content,
      messageData.type
    );

    this.messageContent = '';
    this.showEmojiPicker = false;
    // Scroll immediately after sending
    setTimeout(() => this.scrollToBottom(), 50);
  }

  // Emoji picker methods
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiSelected(emoji: string) {
    this.messageContent += emoji;
    this.showEmojiPicker = false;
    this.messageInput?.nativeElement.focus();
  }

  // File upload methods
  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }

    this.selectedFile = file;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }

    this.uploadFile();
  }

  uploadFile() {
    if (!this.selectedFile || !this.selectedChat) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.chatService
      .uploadFile(
        this.selectedFile,
        this.selectedChat._id,
        this.currentUser._id
      )
      .subscribe({
        next: (response) => {
          console.log('✅ File uploaded:', response);

          // Send file message with metadata via socket
          this.socketService.sendMessage(
            this.selectedChat._id,
            this.currentUser._id,
            response.message.content,
            response.message.type,
            response.message.fileMetadata
          );

          this.selectedFile = null;
          this.filePreview = null;
          this.isUploading = false;
          this.uploadProgress = 0;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('❌ File upload error:', error);
          alert('Failed to upload file: ' + error.message);
          this.isUploading = false;
          this.uploadProgress = 0;
        },
      });
  }

  cancelFileUpload() {
    this.selectedFile = null;
    this.filePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Message formatting
  formatMessageContent(content: string, isFormatted: boolean): SafeHtml {
    if (!content) return '';

    if (isFormatted) {
      const formatted = this.messageFormatter.formatMessage(content);
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    }

    return content;
  }

  toggleFormattingHelp() {
    this.showFormattingHelp = !this.showFormattingHelp;
  }

  insertFormatting(format: string) {
    const textarea = this.messageInput?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.messageContent.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText || 'strikethrough'}~~`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
    }

    this.messageContent =
      this.messageContent.substring(0, start) +
      formattedText +
      this.messageContent.substring(end);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + formattedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  // Scroll management
  onScroll() {
    if (!this.messagesContainer) return;

    const element = this.messagesContainer.nativeElement;
    const threshold = 150;
    const position =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    this.isNearBottom = position < threshold;
  }

  scrollToBottom() {
    if (!this.messagesContainer) {
      console.warn('⚠️ Messages container not available');
      return;
    }

    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
      console.log('📜 Scrolled to bottom:', element.scrollHeight);
    } catch (err) {
      console.error('❌ Error scrolling:', err);
    }
  }

  // Force scroll to bottom (for debugging)
  forceScrollToBottom() {
    setTimeout(() => this.scrollToBottom(), 0);
    setTimeout(() => this.scrollToBottom(), 100);
    setTimeout(() => this.scrollToBottom(), 500);
  }

  // File helpers
  getFileIcon(mimeType: string): string {
    return this.chatService.getFileIcon(mimeType);
  }

  formatFileSize(bytes: number): string {
    return this.chatService.formatFileSize(bytes);
  }

  isImageMessage(message: any): boolean {
    return message.type === 'image';
  }

  isFileMessage(message: any): boolean {
    return ['file', 'video', 'audio'].includes(message.type);
  }

  getFileUrl(fileName: string): string {
    return this.chatService.getFileUrl(fileName);
  }

  downloadFile(message: any) {
    if (message.fileMetadata?.url) {
      window.open(this.environmet.apiUrl + message.fileMetadata.url, '_blank');
    }
  }

  // Existing helper methods
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

  handleCreateChat() {
    if (this.newChatType === 'group') {
      this.createGroupChat();
    } else {
      const selectedUser = this.availableUsers.find(
        (u) => u._id === this.selectedUsers[0]
      );
      if (selectedUser) {
        this.selectPrivateChat(selectedUser);
      }
    }
  }

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

  isVideoMessage(msg: any): boolean {
    return (
      msg.type === 'video' || msg.fileMetadata?.mimeType?.startsWith('video/')
    );
  }

  isAudioMessage(msg: any): boolean {
    return (
      msg.type === 'audio' || msg.fileMetadata?.mimeType?.startsWith('audio/')
    );
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}