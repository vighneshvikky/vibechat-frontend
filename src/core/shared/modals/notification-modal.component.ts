import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
         (click)="close()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp"
           (click)="$event.stopPropagation()">
        
       
        <div [ngClass]="headerClass"
             class="px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div [innerHTML]="icon" class="w-8 h-8"></div>
            <h3 class="text-xl font-bold text-white">{{ title }}</h3>
          </div>
          <button (click)="close()"
                  class="text-white/80 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

      
        <div class="p-6">
          <p class="text-gray-700 text-lg">{{ message }}</p>
          <p *ngIf="subMessage" class="text-gray-500 text-sm mt-2">{{ subMessage }}</p>
        </div>

        
        <div class="px-6 pb-6 flex justify-end space-x-3">
          <button *ngIf="showCancel"
                  (click)="onCancel()"
                  class="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors">
            Cancel
          </button>
          <button (click)="onConfirm()"
                  [ngClass]="confirmButtonClass"
                  class="px-6 py-2 font-semibold rounded-lg transition-all transform hover:scale-105">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class NotificationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Notification';
  @Input() message: string = '';
  @Input() subMessage: string = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() showCancel: boolean = false;
  @Input() confirmText: string = 'OK';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get headerClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
    }
  }

  get confirmButtonClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white';
      default:
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white';
    }
  }

  get icon(): string {
    switch (this.type) {
      case 'success':
        return `<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
      case 'warning':
        return `<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>`;
      case 'error':
        return `<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
      default:
        return `<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.close();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }
}