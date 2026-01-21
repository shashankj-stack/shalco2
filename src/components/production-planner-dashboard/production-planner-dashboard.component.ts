import { Component, ChangeDetectionStrategy, inject, Signal, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { DemandInputComponent } from '../demand-input/demand-input.component';
import { ProductionPlanComponent } from '../production-plan/production-plan.component';
import { SchedulingComponent } from '../scheduling/scheduling.component';

@Component({
  selector: 'app-production-planner-dashboard',
  standalone: true,
  // Fix: Corrected typo in the imports array.
  imports: [SidebarComponent, DemandInputComponent, ProductionPlanComponent, SchedulingComponent],
  templateUrl: './production-planner-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionPlannerDashboardComponent {
  authService = inject(AuthService);
  currentUser: Signal<User | null> = this.authService.currentUser;

  activeView = signal<string>('Production Plan');

  onNavigate(view: string): void {
    this.activeView.set(view);
  }
}