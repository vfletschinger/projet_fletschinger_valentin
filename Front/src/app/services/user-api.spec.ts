import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { User, UserRequest } from '../models/user';
import { UserApi } from './user-api';

describe('UserApi', () => {
  const url = `${environment.apiBaseUrl}/users`;

  const request: UserRequest = {
    login: 'mdupont',
    password: 'Secret123',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
  };
  const user: User = {
    id: 'u-1',
    login: 'mdupont',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  let service: UserApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("récupère la liste sur l'URL issue de environment", () => {
    let list: User[] | undefined;
    service.getAll().subscribe((response) => (list = response));

    const testRequest = http.expectOne(url);
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush([user]);

    expect(list).toEqual([user]);
  });

  it('crée un utilisateur par un POST', () => {
    let created: User | undefined;
    service.create(request).subscribe((response) => (created = response));

    const testRequest = http.expectOne(url);
    expect(testRequest.request.method).toBe('POST');
    expect(testRequest.request.body).toEqual(request);
    testRequest.flush(user, { status: 201, statusText: 'Created' });

    expect(created).toEqual(user);
  });

  it('envoie les identifiants à la route de connexion', () => {
    let logged: User | undefined;
    service
      .login({ login: 'mdupont', password: 'Secret123' })
      .subscribe((response) => (logged = response));

    const testRequest = http.expectOne(`${url}/login`);
    expect(testRequest.request.method).toBe('POST');
    expect(testRequest.request.body).toEqual({ login: 'mdupont', password: 'Secret123' });
    testRequest.flush(user);

    expect(logged).toEqual(user);
  });

  it('traduit un 401 en message lisible', () => {
    let message: string | undefined;
    service
      .login({ login: 'mdupont', password: 'faux' })
      .subscribe({ error: (error: Error) => (message = error.message) });

    http.expectOne(`${url}/login`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(message).toBe('Login ou mot de passe incorrect.');
  });

  it('supprime un utilisateur par un DELETE', () => {
    service.delete('u-1').subscribe();

    expect(http.expectOne(`${url}/u-1`).request.method).toBe('DELETE');
  });

  it('traduit un 409 en message lisible', () => {
    let message: string | undefined;
    service.create(request).subscribe({ error: (error: Error) => (message = error.message) });

    http
      .expectOne(url)
      .flush({ message: 'Login déjà pris.' }, { status: 409, statusText: 'Conflict' });

    expect(message).toBe('Login déjà pris.');
  });

  it('signale un serveur injoignable', () => {
    let message: string | undefined;
    service.getAll().subscribe({ error: (error: Error) => (message = error.message) });

    http
      .expectOne(url)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(message).toContain('injoignable');
  });

  it('retombe sur un message générique quand le serveur ne détaille pas', () => {
    let error: unknown;
    service.create(request).subscribe({ error: (caught: Error) => (error = caught) });

    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('erreur 500');
    expect(error).not.toBeInstanceOf(HttpErrorResponse);
  });
});
