
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ProductionPlanService } from '../../services/production-plan.service';
import { ProductionPlan } from '../../models/production-plan.model';

type PlanStatus = ProductionPlan['status'] | 'All';

@Component({
  selector: 'app-plan-summary',
  standalone: true,
  imports: [],
  templateUrl: './plan-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummaryComponent {
  private planService = inject(ProductionPlanService);
  
  allPlans = this.planService.plans$;
  filterStatus = signal<PlanStatus>('All');

  readonly planStatuses: PlanStatus[] = ['All', 'Finalized', 'Approved', 'Submitted', 'Draft', 'Rejected'];

  readonly filteredPlans = computed(() => {
    const status = this.filterStatus();
    const plans = this.allPlans();
    if (status === 'All') {
      return plans;
    }
    return plans.filter(p => p.status === status);
  });

  setFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value as PlanStatus);
  }
}
