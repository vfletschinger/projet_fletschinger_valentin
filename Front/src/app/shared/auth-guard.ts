import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/** Réserve un écran aux utilisateurs connectés ; les autres passent par la connexion puis reviennent. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(Auth).isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/connexion'], { queryParams: { returnUrl: state.url } });
};
