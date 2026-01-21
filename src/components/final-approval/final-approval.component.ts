
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ProductionPlanService } from '../../services/production-plan.service';
import { SchedulingService } from '../../services/scheduling.service';
import { AuthService } from '../../services/auth.service';
import { ProductionPlan } from '../../models/production-plan.model';
import { ScheduleItem } from '../../models/scheduling.model';

@Component({
  selector: 'app-final-approval',
  standalone: true,
  imports: [],
  templateUrl: './final-approval.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalApprovalComponent {
  private planService = inject(ProductionPlanService);
  private schedulingService = inject(SchedulingService);
  private authService = inject(AuthService);

  // State
  view = signal<'list' | 'detail'>('list');
  selectedPlan = signal<ProductionPlan | null>(null);
  isRejectionModalVisible = signal(false);
  rejectionReason = signal('');

  // Data Signals
  plansForApproval = this.planService.approvedPlans$;
  productionLines = this.schedulingService.productionLines$;
  currentUser = this.authService.currentUser;
  
  scheduleForSelectedPlan = computed(() => {
    const plan = this.selectedPlan();
    if (!plan) return [];
    return this.schedulingService.schedule$().filter(item => item.planId === plan.id);
  });

  // View Management
  viewPlanDetails(plan: ProductionPlan): void {
    this.selectedPlan.set(plan);
    this.view.set('detail');
  }

  backToList(): void {
    this.selectedPlan.set(null);
    this.view.set('list');
  }
  
  getLineName(lineId: string): string {
    return this.productionLines().find(l => l.id === lineId)?.name ?? 'Unknown Line';
  }

  // Modal Management
  openRejectionModal(): void {
    this.rejectionReason.set('');
    this.isRejectionModalVisible.set(true);
  }

  closeRejectionModal(): void {
    this.isRejectionModalVisible.set(false);
  }

  // Actions
  approveSelectedPlan(): void {
    const plan = this.selectedPlan();
    const user = this.currentUser();
    if (!plan || !user) return;

    if (confirm(`This action will finalize and lock the plan "${plan.name}". Are you sure you want to proceed?`)) {
      this.planService.finalizePlan(plan.id, user.name);
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
