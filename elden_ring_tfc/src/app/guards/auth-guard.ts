import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/authService';
import {inject} from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogged()) {
    return true;
  }

  router.navigate(['/login-page']);

  return false;
};
