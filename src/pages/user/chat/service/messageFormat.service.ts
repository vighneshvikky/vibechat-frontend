
import { Injectable } from '@angular/core';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class MessageFormatterService {
  constructor() {}


  formatMessage(content: string): string {
    if (!content) return '';

    try {
      let formatted = content;


      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

     
      formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
      formatted = formatted.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

    
      formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');

 
      formatted = formatted.replace(/`(.+?)`/g, '<code class="inline-code">$1</code>');


      formatted = formatted.replace(/\n/g, '<br>');

    
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