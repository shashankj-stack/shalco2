
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ProductionPlanService } from '../../services/production-plan.service';
import { SchedulingService } from '../../services/scheduling.service';

interface DailyCapacity {
  date: string;
  totalCapacity: number;
  scheduledQty: number;
  submittedQty: number;
  totalDemand: number;
  utilization: number;
  isOverloaded: boolean;
}

@Component({
  selector: 'app-capacity-overview',
  standalone: true,
  imports: [],
  templateUrl: './capacity-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityOverviewComponent {
  private planService = inject(ProductionPlanService);
  private schedulingService = inject(SchedulingService);
  
  private productionLines = this.schedulingService.productionLines$;
  private submittedPlans = this.planService.submittedPlans$;
  private schedule = this.schedulingService.schedule$;

  readonly capacityData = computed(() => {
    const lines = this.productionLines();
    const plans = this.submittedPlans();
    const schedule = this.schedule();
    const totalCapacity = lines.reduce((sum, line) => sum + line.dailyCapacity, 0);
    if (totalCapacity === 0) return [];

    const demandsByDate = new Map<string, { scheduled: number; submitted: number }>();

    // Use a date range of the next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      demandsByDate.set(dateString, { scheduled: 0, submitted: 0 });
    }

    // Aggregate scheduled items within the date range
    schedule.forEach(item => {
      if (demandsByDate.has(item.date)) {
        demandsByDate.get(item.date)!.scheduled += item.quantity;
      }
    });

    // Aggregate submitted plan items within the date range
    plans.forEach(plan => {
      plan.items.forEach(item => {
        if (demandsByDate.has(item.date)) {
          demandsByDate.get(item.date)!.submitted += item.quantity;
        }
      });
    });

    const result: DailyCapacity[] = [];
    const sortedDates = Array.from(demandsByDate.keys()).sort();

    sortedDates.forEach(date => {
      const demands = demandsByDate.get(date)!;
      const totalDemand = demands.scheduled + demands.submitted;
      const utilization = parseFloat(((totalDemand / totalCapacity) * 100).toFixed(1));
      result.push({
        date,
        totalCapacity,
        scheduledQty: demands.scheduled,
        submittedQty: demands.submitted,
        totalDemand,
        utilization,
        isOverloaded: totalDemand > totalCapacity,
      });
    });
    
    return result;
  });
}
