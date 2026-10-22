import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution';
import { PollutionList } from './pollution-list';

describe('PollutionList', () => {
  const url = `${environment.apiBaseUrl}/pollutions`;

  const base: Omit<Pollution, 'id' | 'title' | 'type' | 'place' | 'observedAt'> = {
    description: 'Description',
    latitude: 48.85,
    longitude: 2.35,
    photoUrl: '',
  };
  const pollutions: Pollution[] = [
    {
      ...base,
      id: 'p-1',
      title: 'Bidons',
      type: 'Chimique',
      place: 'Paris',
      observedAt: '2026-09-12',
    },
    {
      ...base,
      id: 'p-2',
      title: 'Sacs',
      type: 'Plastique',
      place: 'Marseille',
      observedAt: '2026-10-03',
    },
    {
      ...base,
      id: 'p-3',
      title: 'Gravats',
      type: 'Dépôt sauvage',
      place: 'Fontainebleau',
      observedAt: '2026-08-20',
    },
  ];

  let fixture: ComponentFixture<PollutionList>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const titles = () =>
    [...el.querySelectorAll('.item-title')].map((title) => title.textContent!.trim());

  async function fill(id: string, value: string): Promise<void> {
    const field = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PollutionList);
    el = fixture.nativeElement;
    fixture.detectChanges();

    http.expectOne(url).flush(pollutions);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it("affiche les pollutions renvoyées par l'API", () => {
    expect(titles()).toEqual(['Bidons', 'Sacs', 'Gravats']);
    expect(el.querySelector('.item-link')!.getAttribute('href')).toBe('/pollutions/p-1');
  });

  it('filtre par texte, type et date en combinant les critères', async () => {
    await fill('search', 'mar');
    expect(titles()).toEqual(['Sacs']);

    await fill('search', '');
    await fill('type', 'Chimique');
    expect(titles()).toEqual(['Bidons']);

    await fill('type', '');
    await fill('since', '2026-09-01');
    expect(titles()).toEqual(['Bidons', 'Sacs']);
    expect(el.textContent).toContain('2 pollution(s) affichée(s) sur 3');
  });

  it('indique quand aucun résultat ne correspond', async () => {
    await fill('search', 'introuvable');

    expect(titles()).toEqual([]);
    expect(el.textContent).toContain('Aucune pollution ne correspond');
  });

  it('supprime une pollution après confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    const request = http.expectOne(`${url}/p-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(titles()).toEqual(['Sacs', 'Gravats']);
  });

  it("ne supprime rien si l'utilisateur annule", () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    http.expectNone(`${url}/p-1`);
    expect(titles()).toHaveLength(3);
  });
});
