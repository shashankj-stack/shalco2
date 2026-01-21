
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  async login(event: Event): Promise<void> {
    event.preventDefault();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.login(this.email(), this.password());
      if (user) {
        switch (user.role) {
          case 'production-planner':
            this.router.navigate(['/planner-dashboard']);
            break;
          case 'production-manager':
            this.router.navigate(['/manager-dashboard']);
            break;
          case 'operations-head':
            this.router.navigate(['/ops-dashboard']);
            break;
          case 'shop-floor':
            this.router.navigate(['/floor-dashboard']);
            break;
          default:
            this.router.navigate(['/login']); // Fallback
        }
      }
    } catch (error: any) {
      this.errorMessage.set(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
