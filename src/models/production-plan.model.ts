
export interface PlanItem {
  id: string; // Corresponds to Demand id
  sku: string;
  quantity: number;
  date: string;
}

export interface ProductionPlan {
  id:string;
  name: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Finalized';
  items: PlanItem[];
  version: number;
  createdBy: string;
  createdAt: string; // ISO string
  lastModified: string; // ISO string
  reviewedBy?: string;
  rejectionReason?: string;
  finalApprovedBy?: string;
}
