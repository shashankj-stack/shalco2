import { Component, ChangeDetectionStrategy, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FinalApprovalComponent } from '../final-approval/final-approval.component';
import { PlanSummaryComponent } from '../plan-summary/plan-summary.component';
import { ReportsComponent } from '../reports/reports.component';
import { AuditTrailComponent } from '../audit-trail/audit-trail.component';

@Component({
  selector: 'app-operations-head-dashboard',
  standalone: true,
  imports: [SidebarComponent, FinalApprovalComponent, PlanSummaryComponent, ReportsComponent, AuditTrailComponent],
  templateUrl: './operations-head-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsHeadDashboardComponent {
  authService = inject(AuthService);
  currentUser: Signal<User | null> = this.authService.currentUser;

  activeView = signal<string>('Plan Summary');

  onNavigate(view: string): void {
    this.activeView.set(view);
  }
}