
export interface ProductionUpdate {
  id: string;
  scheduleItemId: string;
  quantityProduced: number;
  scrap: number;
  updatedAt: string; // ISO String
  updatedBy: string;
}
