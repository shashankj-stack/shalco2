
import { Component, ChangeDetectionStrategy, input, signal, inject, output } from '@angular/core';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  user = input.required<User | null>();
  activeMenuItem = input.required<string>();
  menuItemClicked = output<string>();

  logout(): void {
    this.authService.logout();
  }

  setActive(item: string): void {
    this.menuItemClicked.emit(item);
  }
}
