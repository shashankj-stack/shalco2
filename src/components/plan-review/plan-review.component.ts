import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ProductionPlanService } from '../../services/production-plan.service';
import { SchedulingService } from '../../services/scheduling.service';
import { AuthService } from '../../services/auth.service';
import { ProductionPlan } from '../../models/production-plan.model';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-plan-review',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './plan-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewComponent {
  private planService = inject(ProductionPlanService);
  private schedulingService = inject(SchedulingService);
  private authService = inject(AuthService);

  view = signal<'list' | 'detail'>('list');
  submittedPlans = this.planService.submittedPlans$;
  productionLines = this.schedulingService.productionLines$;
  selectedPlan = signal<ProductionPlan | null>(null);
  
  isRejectionModalVisible = signal(false);
  rejectionReason = signal('');

  currentUser = this.authService.currentUser;

  viewPlanDetails(plan: ProductionPlan): void {
    this.selectedPlan.set(plan);
    this.view.set('detail');
  }

  backToList(): void {
    this.selectedPlan.set(null);
    this.view.set('list');
  }

  getLineUsageOnDate(date: string, lineId: string): number {
    return this.schedulingService.getUsageForLine(lineId, date);
  }

  openRejectionModal(): void {
    this.rejectionReason.set('');
    this.isRejectionModalVisible.set(true);
  }

  closeRejectionModal(): void {
    this.isRejectionModalVisible.set(false);
  }
  
  approveSelectedPlan(): void {
    const plan = this.selectedPlan();
    const user = this.currentUser();
    if (!plan || !user) return;

    if (confirm(`Are you sure you want to approve the plan "${plan.name}"?`)) {
      this.planService.approvePlan(plan.id, user.name);
      this.backToList();
    }
  }

  rejectSelectedPlan(): void {
    const reason = this.rejectionReason().trim();
    if (!reason) {
      alert('A reason is required for rejection.');
      return;
    }
    const plan = this.selectedPlan();
    const user = this.currentUser();
    if (!plan || !user) return;

    this.planService.rejectPlan(plan.id, reason, user.name);
    this.closeRejectionModal();
    this.backToList();
  }
}