
import { Injectable, signal, computed, inject } from '@angular/core';
import { Demand } from '../models/demand.model';
import { AuditService } from './audit.service';

const MOCK_DEMANDS: Demand[] = [
  { 
    id: 'd1', sku: 'SKU-001', quantity: 100, date: '2024-08-01', status: 'Approved', 
    version: 1, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: null
  },
  { 
    id: 'd2', sku: 'SKU-002', quantity: 250, date: '2024-08-05', status: 'Approved', 
    version: 2, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: 'pp1'
  },
  { 
    id: 'd3', sku: 'SKU-003', quantity: 50, date: '2024-08-10', status: 'Approved', 
    version: 1, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: null
  },
    { 
    id: 'd4', sku: 'SKU-004', quantity: 300, date: '2024-08-12', status: 'Approved', 
    version: 1, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: null
  },
  { 
    id: 'd5', sku: 'SKU-005', quantity: 500, date: new Date().toISOString().split('T')[0], status: 'Approved', 
    version: 1, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: 'pp3'
  },
  { 
    id: 'd6', sku: 'SKU-006', quantity: 200, date: new Date().toISOString().split('T')[0], status: 'Approved', 
    version: 1, submittedBy: 'Pat Planner', lastModified: new Date().toISOString(), planId: 'pp3'
  },
];


@Injectable({
  providedIn: 'root'
})
export class DemandService {
  private auditService = inject(AuditService);
  private demands = signal<Demand[]>(MOCK_DEMANDS);
  
  public readonly demands$ = this.demands.asReadonly();
  public readonly availableDemands$ = computed(() => this.demands().filter(d => d.status === 'Approved' && !d.planId));

  getDemands() {
    return this.demands$;
  }

  addDemand(demand: Omit<Demand, 'id' | 'version' | 'status' | 'lastModified' | 'planId'>, submittedBy: string): void {
    const newDemand: Demand = {
      ...demand,
      id: `d${Date.now()}`,
      version: 1,
      status: 'Draft',
      submittedBy,
      lastModified: new Date().toISOString(),
      planId: null
    };
    this.demands.update(demands => [...demands, newDemand]);
    this.auditService.log(`Created new demand for SKU ${newDemand.sku} with quantity ${newDemand.quantity}.`);
  }

  updateDemand(updatedDemand: Demand): void {
    const oldDemand = this.demands().find(d => d.id === updatedDemand.id);
    if (!oldDemand) return;
    
    const changes: string[] = [];
    if (oldDemand.quantity !== updatedDemand.quantity) {
      changes.push(`quantity from ${oldDemand.quantity} to ${updatedDemand.quantity}`);
    }
    if (oldDemand.date !== updatedDemand.date) {
      changes.push(`date from ${oldDemand.date} to ${updatedDemand.date}`);
    }
    
    if(changes.length > 0) {
      this.auditService.log(`Updated demand for SKU ${oldDemand.sku}: ${changes.join(', ')}.`);
    }

    updatedDemand.version += 1;
    updatedDemand.lastModified = new Date().toISOString();
    this.demands.update(demands => 
      demands.map(d => d.id === updatedDemand.id ? updatedDemand : d)
    );
  }

  deleteDemand(id: string): void {
    const demandToDelete = this.demands().find(d => d.id === id);
    if (demandToDelete) {
        this.auditService.log(`Deleted demand for SKU ${demandToDelete.sku}.`);
    }
    this.demands.update(demands => demands.filter(d => d.id !== id));
  }
  
  assignDemandsToPlan(demandIds: string[], planId: string): void {
    this.demands.update(demands =>
      demands.map(d => (demandIds.includes(d.id) ? { ...d, planId } : d))
    );
    // Audit log for this is handled in the plan creation method for better context.
  }
}
