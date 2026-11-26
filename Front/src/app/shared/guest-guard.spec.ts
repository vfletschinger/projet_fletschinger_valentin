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
import { guestGuard } from './guest-guard';

describe('guestGuard', () => {
  const loggedIn = signal(false);

  const run = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, { url: '/connexion' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: { isLoggedIn: loggedIn } }],
    });
  });

  it('laisse passer un visiteur', () => {
    loggedIn.set(false);

    expect(run()).toBe(true);
  });

  it('renvoie un utilisateur déjà connecté vers la liste', () => {
    loggedIn.set(true);

    const result = run() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/pollutions');
  });
});
