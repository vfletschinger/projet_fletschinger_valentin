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
import { guestGuard } from './guest-guard';

describe('guestGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, { url: '/connexion' } as RouterStateSnapshot),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideStore([AuthState])],
    });
  });

  it('laisse passer un visiteur', () => {
    expect(run()).toBe(true);
  });

  it('renvoie un utilisateur déjà connecté vers la liste', () => {
    TestBed.inject(Store).dispatch(new Login({ email: 'marie@exemple.fr', nom: 'Marie Dupont' }));

    const result = run() as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/pollutions');
  });
});
