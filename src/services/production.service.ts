
import { Injectable, signal, inject } from '@angular/core';
import { ProductionUpdate } from '../models/production.model';
import { AuditService } from './audit.service';

// Mock data simulating that some scheduled items have been produced.
const MOCK_PRODUCTION_UPDATES: ProductionUpdate[] = [
  {
    id: 'pu1',
    scheduleItemId: 'sch_today_1', // Corresponds to SKU-005
    quantityProduced: 498,
    scrap: 2,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Frank Floor',
  }
];


@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private auditService = inject(AuditService);
  private productionUpdates = signal<ProductionUpdate[]>(MOCK_PRODUCTION_UPDATES);

  public readonly productionUpdates$ = this.productionUpdates.asReadonly();

  logUpdate(update: Omit<ProductionUpdate, 'id'>): void {
    const newUpdate: ProductionUpdate = {
      ...update,
      id: `pu_${Date.now()}`
    };
    this.productionUpdates.update(updates => [...updates, newUpdate]);
    this.auditService.log(`Logged production for schedule item ${newUpdate.scheduleItemId}: ${newUpdate.quantityProduced} produced, ${newUpdate.scrap} scrap.`);
  }
}
