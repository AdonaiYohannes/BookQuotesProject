import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../Services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = auth.isAuthenticated();
  console.log('[AuthGuard] isAuthenticated =', isAuth);

  if (isAuth) {
    return true;
  }

  console.log('[AuthGuard] Not authenticated, redirecting to /login');
  return router.createUrlTree(['/login']);
};
