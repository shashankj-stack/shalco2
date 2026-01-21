
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const expectedRole = route.data['role'];
    const currentUser = authService.currentUser();
    
    if (!expectedRole || (currentUser && currentUser.role === expectedRole)) {
      return true;
    }
    
    // Role mismatch, redirect to login
    router.navigate(['/login']);
    return false;
  }
  
  // Not authenticated, redirect to login
  router.navigate(['/login']);
  return false;
};
