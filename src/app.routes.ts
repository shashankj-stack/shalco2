
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'planner-dashboard',
    loadComponent: () => import('./components/production-planner-dashboard/production-planner-dashboard.component').then(c => c.ProductionPlannerDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'production-planner' }
  },
  {
    path: 'manager-dashboard',
    loadComponent: () => import('./components/production-manager-dashboard/production-manager-dashboard.component').then(c => c.ProductionManagerDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'production-manager' }
  },
  {
    path: 'ops-dashboard',
    loadComponent: () => import('./components/operations-head-dashboard/operations-head-dashboard.component').then(c => c.OperationsHeadDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'operations-head' }
  },
  {
    path: 'floor-dashboard',
    loadComponent: () => import('./components/shop-floor-dashboard/shop-floor-dashboard.component').then(c => c.ShopFloorDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'shop-floor' }
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(c => c.NotFoundComponent),
  }
];
