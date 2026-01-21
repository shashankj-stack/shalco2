import { Component, ChangeDetectionStrategy, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { PlanReviewComponent } from '../plan-review/plan-review.component';
import { CapacityOverviewComponent } from '../capacity-overview/capacity-overview.component';
import { AuditTrailComponent } from '../audit-trail/audit-trail.component';

@Component({
  selector: 'app-production-manager-dashboard',
  standalone: true,
  imports: [SidebarComponent, PlanReviewComponent, CapacityOverviewComponent, AuditTrailComponent],
  templateUrl: './production-manager-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionManagerDashboardComponent {
  authService = inject(AuthService);
  currentUser: Signal<User | null> = this.authService.currentUser;

  activeView = signal<string>('Plan Review');

  onNavigate(view: string): void {
    this.activeView.set(view);
  }
}