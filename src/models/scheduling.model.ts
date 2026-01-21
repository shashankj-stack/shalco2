
export interface ProductionLine {
  id: string;
  name: string;
  dailyCapacity: number; // in units
}

export interface ScheduleItem {
  id: string; // Unique ID for the schedule entry
  planId: string;
  planItemId: string; // Corresponds to PlanItem id
  sku: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  lineId: string;
  overrideReason?: string;
}
