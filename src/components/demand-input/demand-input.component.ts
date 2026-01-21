
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DemandService } from '../../services/demand.service';
import { AuthService } from '../../services/auth.service';
import { Demand } from '../../models/demand.model';

@Component({
  selector: 'app-demand-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './demand-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandInputComponent implements OnInit {
  private demandService = inject(DemandService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  demands = this.demandService.getDemands();
  currentUser = this.authService.currentUser;

  isModalVisible = signal(false);
  modalTitle = signal('');
  currentDemandId = signal<string | null>(null);
  
  demandForm: FormGroup;

  constructor() {
    this.demandForm = this.fb.group({
      sku: ['', [Validators.required, Validators.pattern('^SKU-[0-9]{3,}$')]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.demandForm.get('date')?.setValidators([Validators.required, this.minDateValidator(today)]);
  }

  minDateValidator(minDate: string) {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      return control.value < minDate ? { minDate: true } : null;
    };
  }

  openModalForCreate(): void {
    this.currentDemandId.set(null);
    this.modalTitle.set('Add New Demand');
    this.demandForm.reset();
    this.isModalVisible.set(true);
  }

  openModalForEdit(demand: Demand): void {
    if (demand.status !== 'Draft') {
      alert('Only drafts can be edited.');
      return;
    }
    this.currentDemandId.set(demand.id);
    this.modalTitle.set(`Edit Demand for ${demand.sku}`);
    this.demandForm.setValue({
      sku: demand.sku,
      quantity: demand.quantity,
      date: demand.date,
    });
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
  }

  saveDemand(): void {
    if (this.demandForm.invalid) {
      this.demandForm.markAllAsTouched();
      return;
    }

    const id = this.currentDemandId();
    const user = this.currentUser();

    if (!user) {
      // Should not happen if user is logged in
      alert('Error: User not found.');
      return;
    }

    if (id) {
      const existingDemand = this.demands().find(d => d.id === id);
      if (existingDemand) {
        const updatedDemand: Demand = {
          ...existingDemand,
          ...this.demandForm.value,
        };
        this.demandService.updateDemand(updatedDemand);
      }
    } else {
      this.demandService.addDemand(this.demandForm.value, user.name);
    }

    this.closeModal();
  }

  onDelete(demand: Demand): void {
    if (demand.status !== 'Draft') {
      alert('Only drafts can be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete the demand for ${demand.sku}?`)) {
      this.demandService.deleteDemand(demand.id);
    }
  }

  get f() { return this.demandForm.controls; }
}
