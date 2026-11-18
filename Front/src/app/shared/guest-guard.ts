import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/** Réserve un écran aux visiteurs : un utilisateur déjà connecté est renvoyé vers la liste. */
export const guestGuard: CanActivateFn = () => {
  if (!inject(Auth).isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/pollutions']);
};
