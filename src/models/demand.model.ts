
export interface Demand {
  id: string;
  sku: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  version: number;
  submittedBy: string;
  lastModified: string; // ISO string
  planId?: string | null;
}
