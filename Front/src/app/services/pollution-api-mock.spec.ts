import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { PollutionRequest } from '../models/pollution';
import { PollutionApi } from './pollution-api';
import { pollutionApiMockInterceptor } from './pollution-api-mock';

describe('pollutionApiMockInterceptor', () => {
  const draft: PollutionRequest = {
    title: 'Fumées noires',
    type: 'Air',
    description: "Panache de fumée au-dessus de l'usine.",
    observedAt: '2026-10-01',
    place: 'Zone industrielle, Lyon',
    latitude: 45.764,
    longitude: 4.8357,
    photoUrl: '',
  };

  let service: PollutionApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([pollutionApiMockInterceptor]))],
    });

    service = TestBed.inject(PollutionApi);
  });

  it("fournit des pollutions d'exemple", async () => {
    const list = await firstValueFrom(service.getAll());

    expect(list.length).toBeGreaterThan(0);
    expect(list.every((pollution) => pollution.id)).toBe(true);
  });

  it('enchaîne création, lecture, modification et suppression', async () => {
    const created = await firstValueFrom(service.create(draft));
    expect(created.id).toBeTruthy();
    expect(created.title).toBe('Fumées noires');

    expect(await firstValueFrom(service.getById(created.id))).toEqual(created);

    const updated = await firstValueFrom(service.update(created.id, { ...draft, type: 'Autre' }));
    expect(updated).toEqual({ ...created, type: 'Autre' });

    await firstValueFrom(service.delete(created.id));
    await expect(firstValueFrom(service.getById(created.id))).rejects.toThrow(/n'existe pas/);
  });

  it('laisse passer les requêtes qui ne visent pas les pollutions', () => {
    const next = vi.fn();
    const request = { method: 'POST', url: '/api/auth/signup', body: null } as never;

    pollutionApiMockInterceptor(request, next);

    expect(next).toHaveBeenCalledWith(request);
  });
});
