import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { UserRequest } from '../models/user';
import { UserApi } from './user-api';
import { SAMPLE_PASSWORD, userApiMockInterceptor } from './user-api-mock';

describe('userApiMockInterceptor', () => {
  const request: UserRequest = {
    login: 'mdupont',
    password: 'Secret123',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
  };

  let service: UserApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([userApiMockInterceptor]))],
    });

    service = TestBed.inject(UserApi);
  });

  it("fournit des utilisateurs d'exemple, sans mot de passe", async () => {
    const list = await firstValueFrom(service.getAll());

    expect(list.length).toBeGreaterThan(0);
    expect(list.every((user) => user.id && !('password' in user))).toBe(true);
  });

  it('enchaîne création, lecture et suppression', async () => {
    const created = await firstValueFrom(service.create(request));
    expect(created.id).toBeTruthy();
    expect(created.login).toBe('mdupont');
    expect(Number.isNaN(Date.parse(created.createdAt))).toBe(false);
    expect(created).not.toHaveProperty('password');

    expect(await firstValueFrom(service.getAll())).toContainEqual(created);

    await firstValueFrom(service.delete(created.id));
    expect(await firstValueFrom(service.getAll())).not.toContainEqual(created);
    await expect(firstValueFrom(service.delete(created.id))).rejects.toThrow(/n'existe pas/);
  });

  it('connecte un compte existant avec son mot de passe', async () => {
    const user = await firstValueFrom(service.login({ login: 'admin', password: SAMPLE_PASSWORD }));

    expect(user.login).toBe('admin');
    expect(user).not.toHaveProperty('password');
  });

  it('connecte un compte juste après son inscription', async () => {
    const created = await firstValueFrom(
      service.create({ ...request, login: 'nouveau', email: 'n@exemple.fr' }),
    );

    expect(
      await firstValueFrom(service.login({ login: 'nouveau', password: 'Secret123' })),
    ).toEqual(created);
  });

  it('refuse un mot de passe erroné', async () => {
    await expect(
      firstValueFrom(service.login({ login: 'admin', password: 'mauvais' })),
    ).rejects.toThrow(/incorrect/);
  });

  it('refuse un login déjà pris', async () => {
    await expect(firstValueFrom(service.create({ ...request, login: 'admin' }))).rejects.toThrow(
      /déjà pris/,
    );
  });

  it('refuse un email déjà associé à un compte', async () => {
    await expect(
      firstValueFrom(service.create({ ...request, login: 'autre', email: 'Deja@exemple.fr' })),
    ).rejects.toThrow(/déjà associé/);
  });

  it('expose une erreur lisible, pas une HttpErrorResponse', async () => {
    let caught: unknown;
    try {
      await firstValueFrom(service.create({ ...request, password: '' }));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught).not.toBeInstanceOf(HttpErrorResponse);
  });

  it('laisse passer les requêtes qui ne visent pas les utilisateurs', () => {
    const next = vi.fn();
    const httpRequest = { method: 'GET', url: '/api/pollutions', body: null } as never;

    userApiMockInterceptor(httpRequest, next);

    expect(next).toHaveBeenCalledWith(httpRequest);
  });
});
