import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Pollution, PollutionRequest } from '../models/pollution';
import { PollutionApi } from './pollution-api';

describe('PollutionApi', () => {
  const url = `${environment.apiBaseUrl}/pollutions`;

  const draft: PollutionRequest = {
    title: 'Bidons abandonnés',
    type: 'Chimique',
    description: 'Trois bidons percés au bord du ruisseau.',
    observedAt: '2026-01-15',
    place: 'Quai de Seine, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: '',
  };
  const pollution: Pollution = { ...draft, id: 'p-1' };

  let service: PollutionApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PollutionApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("récupère la liste sur l'URL issue de environment", () => {
    let list: Pollution[] | undefined;
    service.getAll().subscribe((response) => (list = response));

    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([pollution]);

    expect(list).toEqual([pollution]);
  });

  it('récupère le détail par son identifiant', () => {
    service.getById('p-1').subscribe();

    expect(http.expectOne(`${url}/p-1`).request.method).toBe('GET');
  });

  it('crée une pollution par un POST', () => {
    service.create(draft).subscribe();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(draft);
  });

  it('modifie une pollution par un PUT', () => {
    service.update('p-1', draft).subscribe();

    const request = http.expectOne(`${url}/p-1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(draft);
  });

  it('supprime une pollution par un DELETE', () => {
    service.delete('p-1').subscribe();

    expect(http.expectOne(`${url}/p-1`).request.method).toBe('DELETE');
  });

  it('traduit un 404 en message lisible', () => {
    let message: string | undefined;
    service.getById('inconnue').subscribe({ error: (error: Error) => (message = error.message) });

    http.expectOne(`${url}/inconnue`).flush(null, { status: 404, statusText: 'Not Found' });

    expect(message).toContain("n'existe pas");
  });

  it('signale un serveur injoignable', () => {
    let message: string | undefined;
    service.getAll().subscribe({ error: (error: Error) => (message = error.message) });

    http
      .expectOne(url)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(message).toContain('injoignable');
  });
});
