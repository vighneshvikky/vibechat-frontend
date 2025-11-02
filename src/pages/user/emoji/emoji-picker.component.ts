// emoji-picker.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="emoji-picker-simple">
      <div class="emoji-grid">
        <button
          *ngFor="let emoji of emojis"
          (click)="selectEmoji(emoji)"
          class="emoji-btn"
          [title]="emoji.name"
        >
          {{ emoji.char }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .emoji-picker-simple {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 8px;
      border: 1px solid rgba(168, 85, 247, 0.2);
    }

    .emoji-grid {
      display: flex;
      gap: 4px;
    }

    .emoji-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      font-size: 24px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emoji-btn:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
      transform: scale(1.2);
    }

    .emoji-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class EmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<string>();

  emojis = [
    { char: '😊', name: 'Smiling Face' },
    { char: '❤️', name: 'Heart' },
    { char: '👍', name: 'Thumbs Up' },
    { char: '😂', name: 'Laughing' },
    { char: '🎉', name: 'Party' }
  ];

  selectEmoji(emoji: { char: string; name: string }): void {
    this.emojiSelected.emit(emoji.char);
  }
}