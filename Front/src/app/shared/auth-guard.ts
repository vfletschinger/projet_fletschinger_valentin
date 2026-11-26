import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth/auth.state';

/** Réserve un écran aux utilisateurs connectés ; les autres passent par la connexion puis reviennent. */
export const authGuard: CanActivateFn = (_route, state) => {
  // Lecture ponctuelle de l'état : le guard n'a besoin que de la valeur au moment de la navigation.
  if (inject(Store).selectSnapshot(AuthState.isAuthenticated)) {
    return true;
  }

  return inject(Router).createUrlTree(['/connexion'], { queryParams: { returnUrl: state.url } });
};
