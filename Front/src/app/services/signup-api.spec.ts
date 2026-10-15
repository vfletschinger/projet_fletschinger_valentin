import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { SignupRequest, SignupResponse } from '../models/signup';
import { SignupApi } from './signup-api';

describe('SignupApi', () => {
  const url = `${environment.apiBaseUrl}/auth/signup`;

  const payload: SignupRequest = {
    login: 'mdupont',
    password: 'Secret123',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
  };

  let service: SignupApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SignupApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("poste les identifiants sur l'URL issue de environment", () => {
    let created: SignupResponse | undefined;
    service.signUp(payload).subscribe((response) => (created = response));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    const response: SignupResponse = {
      id: 'u-1',
      login: payload.login,
      lastName: payload.lastName,
      firstName: payload.firstName,
      email: payload.email,
      createdAt: '2026-10-15T10:00:00.000Z',
    };
    request.flush(response, { status: 201, statusText: 'Created' });

    expect(created).toEqual(response);
  });

  it('traduit un 409 en message lisible', () => {
    let message: string | undefined;
    service.signUp(payload).subscribe({ error: (error: Error) => (message = error.message) });

    http
      .expectOne(url)
      .flush({ message: 'Login déjà pris.' }, { status: 409, statusText: 'Conflict' });

    expect(message).toBe('Login déjà pris.');
  });

  it('signale un serveur injoignable', () => {
    let message: string | undefined;
    service.signUp(payload).subscribe({ error: (error: Error) => (message = error.message) });

    http
      .expectOne(url)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(message).toContain('injoignable');
  });

  it('retombe sur un message générique quand le serveur ne détaille pas', () => {
    let error: unknown;
    service.signUp(payload).subscribe({ error: (caught: Error) => (error = caught) });

    http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('erreur 500');
    expect(error).not.toBeInstanceOf(HttpErrorResponse);
  });
});
