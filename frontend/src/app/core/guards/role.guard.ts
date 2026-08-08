import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Capability } from '../models/permissions.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[];
  const requiredCapability = route.data?.['permission'] as Capability;

  if (requiredCapability && !authService.hasCapability(requiredCapability)) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (expectedRoles && expectedRoles.length > 0) {
    if (!authService.hasAnyRole(expectedRoles)) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
