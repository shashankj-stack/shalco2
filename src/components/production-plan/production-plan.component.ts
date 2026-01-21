import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ProductionPlanService } from '../../services/production-plan.service';
import { DemandService } from '../../services/demand.service';
import { AuthService } from '../../services/auth.service';
import { Demand } from '../../models/demand.model';
import { ProductionPlan, PlanItem } from '../../models/production-plan.model';
import { SlicePipe } from '@angular/common';

type View = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-production-plan',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe],
  templateUrl: './production-plan.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionPlanComponent {
  private planService = inject(ProductionPlanService);
  private demandService = inject(DemandService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // State
  view = signal<View>('list');
  plans = this.planService.plans$;
  availableDemands = this.demandService.availableDemands$;
  currentUser = this.authService.currentUser;
  
  // Create/Edit State
  planForm: FormGroup;
  selectedDemands = signal<Demand[]>([]);
  currentPlan = signal<ProductionPlan | null>(null);

  constructor() {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      items: this.fb.array([]),
    });
  }

  // View Changers
  showListView(): void {
    this.view.set('list');
    this.currentPlan.set(null);
    this.selectedDemands.set([]);
  }

  showCreateView(): void {
    this.planForm.reset();
    this.planItems.clear();
    this.currentPlan.set(null);
    this.view.set('create');
  }

  showEditView(plan: ProductionPlan): void {
    if (plan.status !== 'Draft') {
      alert('Only draft plans can be edited.');
      return;
    }
    this.currentPlan.set(plan);
    this.planForm.patchValue({ name: plan.name });
    this.planItems.clear();
    plan.items.forEach(item => this.planItems.push(this.createPlanItem(item)));
    this.view.set('edit');
  }

  // Form Logic
  get planItems(): FormArray {
    return this.planForm.get('items') as FormArray;
  }

  createPlanItem(item: PlanItem): FormGroup {
    return this.fb.group({
      id: [item.id],
      sku: [item.sku],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      date: [item.date, Validators.required],
    });
  }

  onDemandSelection(event: Event, demand: Demand): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedDemands.update(demands => [...demands, demand]);
    } else {
      this.selectedDemands.update(demands => demands.filter(d => d.id !== demand.id));
    }
  }

  createPlanFromSelection(): void {
    if (this.selectedDemands().length === 0) {
      alert('Please select at least one demand item.');
      return;
    }
    const user = this.currentUser();
    if (!user) return;
    
    const planName = `New Plan - ${new Date().toLocaleDateString()}`;
    const newPlan = this.planService.createPlan(planName, this.selectedDemands(), user.name);
    this.showEditView(newPlan);
  }

  // Actions
  savePlan(andSubmit = false): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const planToUpdate = this.currentPlan();
    if (!planToUpdate) return;
    
    const formValue = this.planForm.getRawValue();
    
    const updatedPlan: ProductionPlan = {
      ...planToUpdate,
      name: formValue.name,
      items: formValue.items,
    };
    
    this.planService.updatePlan(updatedPlan);

    if (andSubmit) {
      this.planService.submitPlan(updatedPlan.id);
    }

    this.showListView();
  }

  onDeletePlan(plan: ProductionPlan): void {
    if (plan.status !== 'Draft') {
      alert('Only draft plans can be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete plan "${plan.name}"? This cannot be undone.`)) {
      this.planService.deletePlan(plan.id);
      // Note: In real app, unassign demands from this plan
    }
  }
}