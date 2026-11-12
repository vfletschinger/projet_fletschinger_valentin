import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { Auth } from './auth';

describe('Auth', () => {
  const url = `${environment.apiBaseUrl}/users/login`;

  const user: User = {
    id: 'u-1',
    login: 'mdupont',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  let http: HttpTestingController;

  function createAuth(): Auth {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(Auth);
  }

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it("démarre déconnecté quand rien n'est mémorisé", () => {
    const auth = createAuth();

    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it("mémorise l'utilisateur renvoyé par l'API", () => {
    const auth = createAuth();
    auth.login({ login: 'mdupont', password: 'Secret123' }).subscribe();

    http.expectOne(url).flush(user);

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.user()).toEqual(user);
  });

  it('reste déconnecté si les identifiants sont refusés', () => {
    const auth = createAuth();
    let message: string | undefined;
    auth
      .login({ login: 'mdupont', password: 'faux' })
      .subscribe({ error: (error: Error) => (message = error.message) });

    http.expectOne(url).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(message).toContain('incorrect');
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('survit à un rechargement de la page, puis oublie tout à la déconnexion', () => {
    createAuth().login({ login: 'mdupont', password: 'Secret123' }).subscribe();
    http.expectOne(url).flush(user);

    const reloaded = createAuth();
    expect(reloaded.user()).toEqual(user);

    reloaded.logout();
    expect(reloaded.isLoggedIn()).toBe(false);
    expect(createAuth().isLoggedIn()).toBe(false);
  });
});
