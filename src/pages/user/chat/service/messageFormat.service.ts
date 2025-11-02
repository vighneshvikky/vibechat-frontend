// messageFormat.service.ts
import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class MessageFormatterService {
  constructor() {}

  /**
   * Format message with markdown-style syntax
   * Supports: **bold**, *italic*, ~~strikethrough~~, `code`
   */
  formatMessage(content: string): string {
    if (!content) return '';

    try {
      let formatted = content;

      // Replace **bold** or __bold__
      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

      // Replace *italic* or _italic_ (but not already processed)
      formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
      formatted = formatted.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

      // Replace ~~strikethrough~~
      formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');

      // Replace `code`
      formatted = formatted.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');

      // Replace line breaks
      formatted = formatted.replace(/\n/g, '<br>');

      // Sanitize the HTML
      return DOMPurify.sanitize(formatted, {
        ALLOWED_TAGS: ['strong', 'em', 'del', 'code', 'br', 'b', 'i', 's'],
        ALLOWED_ATTR: ['class'],
      });
    } catch (error) {
      console.error('Error formatting message:', error);
      return this.escapeHtml(content);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getFormattingHints(): string[] {
    return [
      '**bold** for bold text',
      '*italic* for italic text',
      '~~strike~~ for strikethrough',
      '`code` for inline code',
    ];
  }
}