
export type UserRole = 'production-planner' | 'production-manager' | 'operations-head' | 'shop-floor';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}
