import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Store, provideStore } from '@ngxs/store';

import { Login } from '../store/auth/auth.actions';
import { AuthState } from '../store/auth/auth.state';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/pollutions/nouvelle' } as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideStore([AuthState])],
    });
  });

  it('laisse passer un utilisateur connecté', () => {
    TestBed.inject(Store).dispatch(new Login({ email: 'marie@exemple.fr', nom: 'Marie Dupont' }));

    expect(run()).toBe(true);
  });

  it('renvoie un visiteur vers la connexion en retenant la page demandée', () => {
    const result = run() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe(
      '/connexion?returnUrl=%2Fpollutions%2Fnouvelle',
    );
  });
});
