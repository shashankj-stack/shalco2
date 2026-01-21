
import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductionPlan, PlanItem } from '../models/production-plan.model';
import { Demand } from '../models/demand.model';
import { DemandService } from './demand.service';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

const MOCK_PLANS: ProductionPlan[] = [
  {
    id: 'pp1',
    name: 'Weekly Plan - Week 32',
    status: 'Submitted',
    items: [
      { id: 'd2', sku: 'SKU-002', quantity: 250, date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0] }
    ],
    version: 1,
    createdBy: 'Pat Planner',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  },
  {
    id: 'pp2',
    name: 'Urgent Components - Week 33',
    status: 'Approved',
    items: [
      { id: 'd1', sku: 'SKU-001', quantity: 100, date: '2024-08-15' },
      { id: 'd3', sku: 'SKU-003', quantity: 50, date: '2024-08-16' },
      { id: 'd4', sku: 'SKU-004', quantity: 300, date: '2024-08-17' },
    ],
    version: 2,
    createdBy: 'Pat Planner',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    reviewedBy: 'Mary Manager',
  },
  {
    id: 'pp3',
    name: 'Daily Production Run - Today',
    status: 'Finalized',
    items: [
      { id: 'd5', sku: 'SKU-005', quantity: 500, date: new Date().toISOString().split('T')[0] },
      { id: 'd6', sku: 'SKU-006', quantity: 200, date: new Date().toISOString().split('T')[0] },
    ],
    version: 3,
    createdBy: 'Pat Planner',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    lastModified: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    reviewedBy: 'Mary Manager',
    finalApprovedBy: 'Olivia Ops',
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductionPlanService {
  private demandService = inject(DemandService);
  private auditService = inject(AuditService);
  private notificationService = inject(NotificationService);
  private plans = signal<ProductionPlan[]>(MOCK_PLANS);

  public readonly plans$ = this.plans.asReadonly();
  public readonly approvedPlans$ = computed(() => this.plans().filter(p => p.status === 'Approved'));
  public readonly submittedPlans$ = computed(() => this.plans().filter(p => p.status === 'Submitted'));

  createPlan(name: string, demands: Demand[], createdBy: string): ProductionPlan {
    const newPlan: ProductionPlan = {
      id: `pp${Date.now()}`,
      name,
      status: 'Draft',
      items: demands.map(d => ({
        id: d.id,
        sku: d.sku,
        quantity: d.quantity,
        date: d.date,
      })),
      version: 1,
      createdBy,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    this.plans.update(plans => [...plans, newPlan]);
    this.demandService.assignDemandsToPlan(demands.map(d => d.id), newPlan.id);
    this.auditService.log(`Created plan "${newPlan.name}" with ${newPlan.items.length} demand items.`);
    return newPlan;
  }

  updatePlan(updatedPlan: ProductionPlan): void {
    const oldPlan = this.plans().find(p => p.id === updatedPlan.id);
    if (oldPlan && oldPlan.name !== updatedPlan.name) {
      this.auditService.log(`Renamed plan from "${oldPlan.name}" to "${updatedPlan.name}".`);
    } else {
      this.auditService.log(`Updated items in plan "${updatedPlan.name}".`);
    }

    updatedPlan.version += 1;
    updatedPlan.lastModified = new Date().toISOString();
    this.plans.update(plans => 
      plans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  }

  submitPlan(planId: string): void {
    let planName = '';
    this.plans.update(plans =>
      plans.map(p => {
        if (p.id === planId) {
          planName = p.name;
          return { ...p, status: 'Submitted', lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
    if(planName) {
      this.auditService.log(`Submitted plan "${planName}" for review.`);
      this.notificationService.showInfo(`Plan "${planName}" has been submitted.`);
    }
  }

  deletePlan(planId: string): void {
    const planToDelete = this.plans().find(p => p.id === planId);
    if(planToDelete) {
        this.auditService.log(`Deleted plan "${planToDelete.name}".`);
    }
    this.plans.update(plans => plans.filter(p => p.id !== planId));
  }
  
  approvePlan(planId: string, reviewedBy: string): void {
    let planName = '';
    this.plans.update(plans =>
      plans.map(p => {
        if (p.id === planId) {
          planName = p.name;
          return { ...p, status: 'Approved', reviewedBy, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
    if(planName) {
      this.auditService.log(`Approved plan "${planName}".`);
      this.notificationService.showSuccess(`Plan "${planName}" has been approved.`);
    }
  }

  rejectPlan(planId: string, reason: string, reviewedBy: string): void {
     let planName = '';
    this.plans.update(plans =>
      plans.map(p => {
        if (p.id === planId) {
          planName = p.name;
          return { ...p, status: 'Rejected', rejectionReason: reason, reviewedBy, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
    if(planName) {
      this.auditService.log(`Rejected plan "${planName}". Reason: ${reason}`);
      this.notificationService.showError(`Plan "${planName}" has been rejected.`);
    }
  }

  finalizePlan(planId: string, finalApprovedBy: string): void {
     let planName = '';
    this.plans.update(plans =>
      plans.map(p => {
        if (p.id === planId) {
          planName = p.name;
          return { ...p, status: 'Finalized', finalApprovedBy, lastModified: new Date().toISOString() };
        }
        return p;
      })
    );
    if(planName) {
      this.auditService.log(`Finalized and locked plan "${planName}".`);
      this.notificationService.showSuccess(`Plan "${planName}" has been finalized.`);
    }
  }
}
