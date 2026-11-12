import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { Auth } from '../services/auth';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const loggedIn = signal(false);

  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/pollutions/nouvelle' } as RouterStateSnapshot,
      ),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: { isLoggedIn: loggedIn } }],
    });
  });

  it('laisse passer un utilisateur connecté', () => {
    loggedIn.set(true);

    expect(run()).toBe(true);
  });

  it('renvoie un visiteur vers la connexion en retenant la page demandée', () => {
    loggedIn.set(false);

    const result = run() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe(
      '/connexion?returnUrl=%2Fpollutions%2Fnouvelle',
    );
  });
});
