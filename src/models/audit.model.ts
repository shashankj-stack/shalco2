
export interface AuditLog {
  id: string;
  timestamp: string; // Using locale string for readability
  userName: string;
  userRole: string;
  action: string;
}
