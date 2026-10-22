import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution';
import { PollutionForm } from './pollution-form';

describe('PollutionForm', () => {
  const url = `${environment.apiBaseUrl}/pollutions`;

  const existing: Pollution = {
    id: 'p-1',
    title: 'Bidons abandonnés',
    type: 'Chimique',
    description: 'Trois bidons percés au bord du ruisseau.',
    observedAt: '2026-01-15',
    place: 'Quai de Seine, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: '',
  };

  let fixture: ComponentFixture<PollutionForm>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const input = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;

  async function render(id?: string): Promise<void> {
    fixture = TestBed.createComponent(PollutionForm);
    fixture.componentRef.setInput('id', id);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function fill(id: string, value: string): Promise<void> {
    const field = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input'));
    field.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function fillAll(photoUrl = ''): Promise<void> {
    await fill('title', 'Bidons abandonnés');
    await fill('type', 'Chimique');
    await fill('description', 'Trois bidons percés au bord du ruisseau.');
    await fill('observedAt', '2026-01-15');
    await fill('place', 'Quai de Seine, Paris');
    await fill('latitude', '48.8566');
    await fill('longitude', '2.3522');
    await fill('photoUrl', photoUrl);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollutionForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  describe('en création', () => {
    beforeEach(() => render());

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
      expect(el.querySelector('h1')!.textContent).toBe('Déclarer une pollution');
    });

    it('signale les champs requis au lieu de soumettre un formulaire vide', () => {
      submitButton().click();
      fixture.detectChanges();

      expect(el.textContent).toContain('Le titre est requis.');
    });

    it('refuse une latitude hors bornes', async () => {
      await fillAll();
      await fill('latitude', '120');

      expect(el.textContent).toContain('La latitude doit être comprise entre -90 et 90.');
    });

    it("refuse une date postérieure à aujourd'hui", async () => {
      await fillAll();
      await fill('observedAt', '2099-01-01');

      expect(el.textContent).toContain('La date ne peut pas être dans le futur.');
    });

    it("refuse un champ texte rempli uniquement d'espaces", async () => {
      await fillAll();
      await fill('title', '   ');

      expect(el.textContent).toContain('Le titre est requis.');

      submitButton().click();
      fixture.detectChanges();

      http.expectNone(url);
    });

    it("envoie la déclaration nettoyée à l'API puis ouvre son détail", async () => {
      await fillAll('https://exemple.fr/pollution.jpg');
      await fill('title', '  Bidons abandonnés  ');
      submitButton().click();
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);

      const request = http.expectOne(url);
      const { id: _id, ...draft } = existing;
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({
        ...draft,
        photoUrl: 'https://exemple.fr/pollution.jpg',
      });

      request.flush({ ...request.request.body, id: 'p-9' }, { status: 201, statusText: 'Created' });

      expect(navigate).toHaveBeenCalledWith(['/pollutions', 'p-9']);
    });

    it("affiche l'erreur du serveur et réactive le bouton", async () => {
      await fillAll();
      submitButton().click();
      fixture.detectChanges();

      http.expectOne(url).flush(null, { status: 500, statusText: 'Server Error' });
      await fixture.whenStable();

      expect(el.textContent).toContain('erreur 500');
      expect(submitButton().disabled).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('en modification', () => {
    beforeEach(async () => {
      await render('p-1');
      http.expectOne(`${url}/p-1`).flush(existing);
      await fixture.whenStable();
    });

    it('pré-remplit le formulaire avec la pollution existante', () => {
      expect(el.querySelector('h1')!.textContent).toBe('Modifier la pollution');
      expect(input('title').value).toBe('Bidons abandonnés');
      expect(input('latitude').value).toBe('48.8566');
    });

    it('enregistre les modifications par un PUT', async () => {
      await fill('place', 'Pont Neuf, Paris');
      submitButton().click();
      fixture.detectChanges();

      const request = http.expectOne(`${url}/p-1`);
      expect(request.request.method).toBe('PUT');
      expect(request.request.body.place).toBe('Pont Neuf, Paris');

      request.flush({ ...existing, place: 'Pont Neuf, Paris' });

      expect(navigate).toHaveBeenCalledWith(['/pollutions', 'p-1']);
    });
  });
});
