import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { SignupRequest } from '../models/signup';
import { apiMockInterceptor } from './api-mock';
import { SignupApi } from './signup-api';

describe('apiMockInterceptor', () => {
  const payload: SignupRequest = {
    login: 'mdupont',
    password: 'Secret123',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
  };

  let service: SignupApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiMockInterceptor]))],
    });

    service = TestBed.inject(SignupApi);
  });

  it("répond à la place de l'API avec un compte créé", async () => {
    const created = await firstValueFrom(service.signUp(payload));

    expect(created.id).toBeTruthy();
    expect(created.login).toBe('mdupont');
    expect(created.email).toBe('marie@exemple.fr');
    expect(Number.isNaN(Date.parse(created.createdAt))).toBe(false);
    expect(created).not.toHaveProperty('password');
  });

  it('refuse un login déjà pris', async () => {
    await expect(firstValueFrom(service.signUp({ ...payload, login: 'admin' }))).rejects.toThrow(
      /déjà pris/,
    );
  });

  it('refuse un email déjà associé à un compte', async () => {
    await expect(
      firstValueFrom(service.signUp({ ...payload, email: 'deja@exemple.fr' })),
    ).rejects.toThrow(/déjà associé/);
  });

  it("laisse passer les requêtes qui ne visent pas l'inscription", () => {
    const next = vi.fn();
    const request = { method: 'GET', url: '/api/pollutions', body: null } as never;

    apiMockInterceptor(request, next);

    expect(next).toHaveBeenCalledWith(request);
  });

  it('expose une erreur HTTP, pas une exception brute', async () => {
    let caught: unknown;
    try {
      await firstValueFrom(service.signUp({ ...payload, login: 'root' }));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught).not.toBeInstanceOf(HttpErrorResponse);
  });
});
