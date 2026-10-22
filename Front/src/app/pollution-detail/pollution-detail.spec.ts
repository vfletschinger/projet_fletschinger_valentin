import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution';
import { PollutionDetail } from './pollution-detail';

describe('PollutionDetail', () => {
  const url = `${environment.apiBaseUrl}/pollutions/p-1`;

  const pollution: Pollution = {
    id: 'p-1',
    title: 'Bidons abandonnés',
    type: 'Chimique',
    description: 'Trois bidons percés au bord du ruisseau.',
    observedAt: '2026-01-15',
    place: 'Quai de Seine, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: 'https://exemple.fr/pollution.jpg',
  };

  let fixture: ComponentFixture<PollutionDetail>;
  let el: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PollutionDetail);
    fixture.componentRef.setInput('id', 'p-1');
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('affiche le détail de la pollution demandée', async () => {
    http.expectOne(url).flush(pollution);
    await fixture.whenStable();

    expect(el.querySelector('h2')!.textContent).toBe('Bidons abandonnés');
    expect(el.textContent).toContain('15/01/2026');
    expect(el.textContent).toContain('Quai de Seine, Paris');
    expect(el.querySelector('img')!.getAttribute('src')).toBe(pollution.photoUrl);
    expect(el.querySelector('.actions a')!.getAttribute('href')).toBe('/pollutions/p-1/modifier');
  });

  it("signale une pollution qui n'existe pas", async () => {
    http.expectOne(url).flush(null, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(el.querySelector('[role="alert"]')!.textContent).toContain("n'existe pas");
    expect(el.querySelector('app-pollution-recap')).toBeNull();
  });

  it('supprime la pollution puis revient à la liste', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    http.expectOne(url).flush(pollution);
    await fixture.whenStable();

    el.querySelector<HTMLButtonElement>('.btn-danger')!.click();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigate).toHaveBeenCalledWith(['/pollutions']);
  });
});
