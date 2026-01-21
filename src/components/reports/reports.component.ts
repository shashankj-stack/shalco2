
import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ProductionPlanService } from '../../services/production-plan.service';
import { SchedulingService } from '../../services/scheduling.service';
import { ProductionService } from '../../services/production.service';

interface ReportRow {
  date: string;
  sku: string;
  planName: string;
  lineName: string;
  plannedQty: number;
  producedQty: number;
  scrap: number;
  variance: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  private planService = inject(ProductionPlanService);
  private schedulingService = inject(SchedulingService);
  private productionService = inject(ProductionService);
  private fb = inject(FormBuilder);

  // Filters
  filterForm = this.fb.group({
    startDate: [''],
    endDate: [''],
    sku: [''],
  });

  // Data Signals
  private allPlans = this.planService.plans$;
  private allScheduledItems = this.schedulingService.schedule$;
  private allProductionUpdates = this.productionService.productionUpdates$;
  private allLines = this.schedulingService.productionLines$;

  // Computed Report Data
  readonly filteredReportData = computed(() => {
    const plans = this.allPlans();
    const scheduledItems = this.allScheduledItems();
    const updates = this.allProductionUpdates();
    const lines = this.allLines();
    const { startDate, endDate, sku } = this.filterForm.value;

    const finalizedPlans = plans.filter(p => p.status === 'Finalized');
    const finalizedPlanIds = new Set(finalizedPlans.map(p => p.id));
    
    const reportRows: ReportRow[] = [];

    scheduledItems
      .filter(item => finalizedPlanIds.has(item.planId))
      .forEach(item => {
        const update = updates.find(u => u.scheduleItemId === item.id);
        const plan = finalizedPlans.find(p => p.id === item.planId);
        const line = lines.find(l => l.id === item.lineId);
        
        const producedQty = update?.quantityProduced ?? 0;
        const scrap = update?.scrap ?? 0;

        reportRows.push({
          date: item.date,
          sku: item.sku,
          planName: plan?.name ?? 'Unknown Plan',
          lineName: line?.name ?? 'Unknown Line',
          plannedQty: item.quantity,
          producedQty: producedQty,
          scrap: scrap,
          variance: producedQty - item.quantity,
        });
      });

    // Apply filters
    return reportRows.filter(row => {
      const isAfterStartDate = !startDate || row.date >= startDate;
      const isBeforeEndDate = !endDate || row.date <= endDate;
      const matchesSku = !sku || row.sku.toLowerCase().includes(sku.toLowerCase());
      return isAfterStartDate && isBeforeEndDate && matchesSku;
    }).sort((a, b) => a.date.localeCompare(b.date));
  });

  exportData(): void {
    alert('Export functionality is not yet implemented.');
  }
}
