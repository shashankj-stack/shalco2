
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuditService } from '../../services/audit.service';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [],
  templateUrl: './audit-trail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditTrailComponent {
  private auditService = inject(AuditService);
  
  logs = this.auditService.logs$;
}
