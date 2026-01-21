import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SchedulingService } from '../../services/scheduling.service';
import { ProductionService } from '../../services/production.service';
import { AuthService } from '../../services/auth.service';
import { ScheduleItem } from '../../models/scheduling.model';

interface DisplayScheduleItem extends ScheduleItem {
  lineName: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-todays-schedule',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './todays-schedule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodaysScheduleComponent {
  private schedulingService = inject(SchedulingService);
  private productionService = inject(ProductionService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // State
  isModalVisible = signal(false);
  selectedScheduleItem = signal<DisplayScheduleItem | null>(null);
  
  // Data
  public readonly today = new Date().toISOString().split('T')[0];
  private schedule = this.schedulingService.schedule$;
  private lines = this.schedulingService.productionLines$;
  private updates = this.productionService.productionUpdates$;
  private currentUser = this.authService.currentUser;

  // Form
  updateForm: FormGroup;

  // Computed display data
  readonly todaysSchedule = computed(() => {
    const todaysItems = this.schedule().filter(item => item.date === this.today);
    const productionLines = this.lines();
    const productionUpdates = this.updates();
    const updatedIds = new Set(productionUpdates.map(u => u.scheduleItemId));

    return todaysItems.map(item => ({
      ...item,
      lineName: productionLines.find(l => l.id === item.lineId)?.name ?? 'Unknown Line',
      isCompleted: updatedIds.has(item.id),
    })).sort((a,b) => a.lineName.localeCompare(b.lineName));
  });

  constructor() {
    this.updateForm = this.fb.group({
      producedQty: [null, [Validators.required, Validators.min(0)]],
      scrapQty: [0, [Validators.required, Validators.min(0)]],
      reason: [''],
    });
  }

  openUpdateModal(item: DisplayScheduleItem): void {
    this.selectedScheduleItem.set(item);
    this.updateForm.reset({ scrapQty: 0 }); // Reset form with default scrap
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.selectedScheduleItem.set(null);
  }
  
  logUpdate(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }
    
    const item = this.selectedScheduleItem();
    const user = this.currentUser();
    if (!item || !user) return;

    const { producedQty, scrapQty, reason } = this.updateForm.value;
    const variance = producedQty - item.quantity;

    if ((variance !== 0 || scrapQty > 0) && !reason) {
      alert('A reason is required when production quantity does not match the plan or scrap is reported.');
      this.updateForm.get('reason')?.setValidators(Validators.required);
      this.updateForm.get('reason')?.updateValueAndValidity();
      this.updateForm.markAllAsTouched();
      return;
    }
    
    this.productionService.logUpdate({
      scheduleItemId: item.id,
      quantityProduced: producedQty,
      scrap: scrapQty,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
    });

    this.closeModal();
  }
}