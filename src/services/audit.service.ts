
import { Injectable, inject, signal } from '@angular/core';
import { AuditLog } from '../models/audit.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private authService = inject(AuthService);
  private logs = signal<AuditLog[]>([]);
  
  public readonly logs$ = this.logs.asReadonly();

  log(action: string): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.warn('Audit log attempted without a current user.');
      return;
    }

    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action: action,
    };

    this.logs.update(currentLogs => [newLog, ...currentLogs]);
  }
}
