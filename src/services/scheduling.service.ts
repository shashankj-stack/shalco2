
import { Injectable, signal, computed, inject } from '@angular/core';
import { ProductionLine, ScheduleItem } from '../models/scheduling.model';
import { ProductionPlanService } from './production-plan.service';
import { AuditService } from './audit.service';

export interface ScheduleConflict {
  line: ProductionLine;
  overage: number;
}

const MOCK_LINES: ProductionLine[] = [
  { id: 'line1', name: 'Assembly Line 1', dailyCapacity: 1000 },
  { id: 'line2', name: 'Component Line A', dailyCapacity: 500 },
  { id: 'line3', name: 'Finishing Line', dailyCapacity: 800 },
];

const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch_today_1',
    planId: 'pp3',
    planItemId: 'd5',
    sku: 'SKU-005',
    quantity: 500,
    date: new Date().toISOString().split('T')[0],
    lineId: 'line1'
  },
  {
    id: 'sch_today_2',
    planId: 'pp3',
    planItemId: 'd6',
    sku: 'SKU-006',
    quantity: 200,
    date: new Date().toISOString().split('T')[0],
    lineId: 'line2'
  }
];


@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private planService = inject(ProductionPlanService);
  private auditService = inject(AuditService);
  private schedule = signal<ScheduleItem[]>(MOCK_SCHEDULE);
  private productionLines = signal<ProductionLine[]>(MOCK_LINES);

  public readonly schedule$ = this.schedule.asReadonly();
  public readonly productionLines$ = this.productionLines.asReadonly();
  public readonly scheduledPlanItemIds$ = computed(() => new Set(this.schedule().map(item => item.planItemId)));

  getUsageForLine(lineId: string, date: string): number {
    return this.schedule$()
      .filter(item => item.lineId === lineId && item.date === date)
      .reduce((sum, item) => sum + item.quantity, 0);
  }
  
  checkForConflict(item: Omit<ScheduleItem, 'id'>): ScheduleConflict | null {
    const line = this.productionLines$().find(l => l.id === item.lineId);
    if (!line) {
      throw new Error('Production line not found');
    }
    const currentUsage = this.getUsageForLine(item.lineId, item.date);
    const newUsage = currentUsage + item.quantity;
    
    if (newUsage > line.dailyCapacity) {
      return { line, overage: newUsage - line.dailyCapacity };
    }
    
    return null;
  }

  scheduleItem(item: Omit<ScheduleItem, 'id'>): void {
    const plans = this.planService.plans$();
    const plan = plans.find(p => p.id === item.planId);
    
    if (plan && plan.status !== 'Approved') {
        alert(`Items can only be scheduled for 'Approved' plans. This plan is currently '${plan.status}'.`);
        return;
    }

    const newScheduleItem: ScheduleItem = {
      ...item,
      id: `sch_${Date.now()}`
    };
    this.schedule.update(s => [...s, newScheduleItem]);
    
    const lineName = this.productionLines$().find(l => l.id === item.lineId)?.name ?? 'Unknown Line';
    let logMessage = `Scheduled ${item.quantity} of SKU ${item.sku} on ${lineName} for ${item.date}.`;
    if(item.overrideReason) {
      logMessage += ` Capacity override reason: ${item.overrideReason}.`;
    }
    this.auditService.log(logMessage);
  }

  unscheduleItem(itemId: string): void {
    const itemToUnschedule = this.schedule$().find(i => i.id === itemId);
    if (!itemToUnschedule) return;

    const plan = this.planService.plans$().find(p => p.id === itemToUnschedule.planId);
    if (plan && plan.status === 'Finalized') {
      alert('Cannot modify the schedule of a finalized plan.');
      return;
    }

    this.schedule.update(s => s.filter(item => item.id !== itemId));
    const lineName = this.productionLines$().find(l => l.id === itemToUnschedule.lineId)?.name ?? 'Unknown Line';
    this.auditService.log(`Unscheduled ${itemToUnschedule.quantity} of SKU ${itemToUnschedule.sku} from ${lineName} on ${itemToUnschedule.date}.`);
  }
}
