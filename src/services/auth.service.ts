
import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: WritableSignal<User | null> = signal(null);
  
  public readonly currentUser: Signal<User | null> = this._currentUser.asReadonly();
  public readonly isAuthenticated: Signal<boolean> = computed(() => !!this._currentUser());

  constructor(private router: Router) {}

  login(email: string, password: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'planner@test.com' && password === 'planner123') {
          const user: User = { name: 'Pat Planner', email, role: 'production-planner' };
          this._currentUser.set(user);
          resolve(user);
        } else if (email === 'manager@test.com' && password === 'manager123') {
          const user: User = { name: 'Mary Manager', email, role: 'production-manager' };
          this._currentUser.set(user);
          resolve(user);
        } else if (email === 'ops@test.com' && password === 'ops123') {
          const user: User = { name: 'Olivia Ops', email, role: 'operations-head' };
          this._currentUser.set(user);
          resolve(user);
        } else if (email === 'floor@test.com' && password === 'floor123') {
          const user: User = { name: 'Frank Floor', email, role: 'shop-floor' };
          this._currentUser.set(user);
          resolve(user);
        } else {
          reject('Invalid email or password');
        }
      }, 500);
    });
  }

  logout(): void {
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
