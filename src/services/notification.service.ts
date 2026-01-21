
import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private nextId = 0;

  private show(message: string, type: 'success' | 'info' | 'error'): void {
    const notification: Notification = {
      id: this.nextId++,
      message,
      type
    };
    this.notifications.update(n => [...n, notification]);

    setTimeout(() => {
      this.dismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds
  }

  showSuccess(message: string): void {
    this.show(message, 'success');
  }
  
  showInfo(message: string): void {
    this.show(message, 'info');
  }

  showError(message: string): void {
    this.show(message, 'error');
  }

  dismiss(id: number): void {
    this.notifications.update(n => n.filter(notification => notification.id !== id));
  }
}
