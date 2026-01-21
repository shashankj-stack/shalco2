
import { Component, ChangeDetectionStrategy, inject, signal, computed, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductionPlanService } from '../../services/production-plan.service';
import { SchedulingService, ScheduleConflict } from '../../services/scheduling.service';
import { PlanItem } from '../../models/production-plan.model';
import { ProductionLine, ScheduleItem } from '../../models/scheduling.model';

interface SchedulingModalData {
  planId: string;
  item: PlanItem;
}

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './scheduling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulingComponent {
  private planService = inject(ProductionPlanService);
  private schedulingService = inject(SchedulingService);
  private fb = inject(FormBuilder);

  // State
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  
  // Data Signals
  approvedPlans = this.planService.approvedPlans$;
  productionLines = this.schedulingService.productionLines$;
  schedule = this.schedulingService.schedule$;
  scheduledPlanItemIds = this.schedulingService.scheduledPlanItemIds$;

  // Modal State
  isSchedulingModalVisible = signal(false);
  isConflictModalVisible = signal(false);
  modalData: WritableSignal<SchedulingModalData | null> = signal(null);
  conflictData: WritableSignal<ScheduleConflict | null> = signal(null);
  overrideReason = signal('');

  // Forms
  scheduleForm: FormGroup;

  // Computed Signals
  unscheduledItems = computed(() => {
    const scheduledIds = this.scheduledPlanItemIds();
    return this.approvedPlans()
      .flatMap(plan => 
        plan.items
          .filter(item => !scheduledIds.has(item.id))
          .map(item => ({ planId: plan.id, ...item }))
      );
  });

  scheduleForDate = computed(() => {
    const date = this.selectedDate();
    const sch = this.schedule();
    return sch.filter(item => item.date === date);
  });

  constructor() {
    this.scheduleForm = this.fb.group({
      quantity: [null, [Validators.required, Validators.min(1)]],
      lineId: ['', Validators.required],
    });
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }
  
  getLineUsage(lineId: string): number {
    return this.schedulingService.getUsageForLine(lineId, this.selectedDate());
  }

  // Modal Handling
  openSchedulingModal(planId: string, item: PlanItem): void {
    this.modalData.set({ planId, item });
    this.scheduleForm.reset();
    this.scheduleForm.patchValue({ quantity: item.quantity });
    this.isSchedulingModalVisible.set(true);
  }

  closeModals(): void {
    this.isSchedulingModalVisible.set(false);
    this.isConflictModalVisible.set(false);
    this.modalData.set(null);
    this.conflictData.set(null);
    this.overrideReason.set('');
  }
  
  // Scheduling Logic
  handleScheduleAttempt(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const data = this.modalData();
    if (!data) return;

    const { quantity, lineId } = this.scheduleForm.value;

    const itemToSchedule: Omit<ScheduleItem, 'id'> = {
      planId: data.planId,
      planItemId: data.item.id,
      sku: data.item.sku,
      quantity,
      date: this.selectedDate(),
      lineId,
    };
    
    const conflict = this.schedulingService.checkForConflict(itemToSchedule);

    if (conflict) {
      this.conflictData.set(conflict);
      this.isConflictModalVisible.set(true);
    } else {
      this.schedulingService.scheduleItem(itemToSchedule);
      this.closeModals();
    }
  }

  handleScheduleWithOverride(): void {
    if (this.overrideReason().trim().length === 0) {
      alert('An override reason is required to exceed capacity.');
      return;
    }

    const data = this.modalData();
    if (!data) return;

    const { quantity, lineId } = this.scheduleForm.value;

    const itemToSchedule: Omit<ScheduleItem, 'id'> = {
      planId: data.planId,
      planItemId: data.item.id,
      sku: data.item.sku,
      quantity,
      date: this.selectedDate(),
      lineId,
      overrideReason: this.overrideReason(),
    };
    
    this.schedulingService.scheduleItem(itemToSchedule);
    this.closeModals();
  }

  onUnschedule(itemId: string): void {
    if (confirm('Are you sure you want to remove this item from the schedule?')) {
      this.schedulingService.unscheduleItem(itemId);
    }
  }
}
