import { Component, ChangeDetectionStrategy, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { TodaysScheduleComponent } from '../todays-schedule/todays-schedule.component';

@Component({
  selector: 'app-shop-floor-dashboard',
  standalone: true,
  imports: [SidebarComponent, TodaysScheduleComponent],
  templateUrl: './shop-floor-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopFloorDashboardComponent {
  authService = inject(AuthService);
  currentUser: Signal<User | null> = this.authService.currentUser;

  activeView = signal<string>('Today’s Schedule');

  onNavigate(view: string): void {
    this.activeView.set(view);
  }
}