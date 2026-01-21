
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [],
  templateUrl: './notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }

  getIconClass(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'fa-check-circle text-green-500';
      case 'info': return 'fa-info-circle text-blue-500';
      case 'error': return 'fa-times-circle text-red-500';
    }
  }
}
