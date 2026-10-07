import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollutionForm } from './pollution-form';

describe('PollutionForm', () => {
  let fixture: ComponentFixture<PollutionForm>;
  let el: HTMLElement;

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

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
    }).compileComponents();

    fixture = TestBed.createComponent(PollutionForm);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('signale les champs requis au lieu de soumettre un formulaire vide', () => {
    submitButton().click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Le titre est requis.');
    expect(el.querySelector('form')).not.toBeNull();
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

  it('masque le formulaire et affiche le récapitulatif quand tout est valide', async () => {
    await fillAll();
    submitButton().click();
    fixture.detectChanges();

    expect(el.querySelector('form')).toBeNull();
    expect(el.textContent).toContain('Bidons abandonnés');
    expect(el.textContent).toContain('Chimique');
    expect(el.textContent).toContain('15/01/2026');
    expect(el.textContent).toContain('48.8566');
    expect(el.querySelector('img')).toBeNull();
  });

  it('affiche la photo quand une URL est fournie', async () => {
    await fillAll('https://exemple.fr/pollution.jpg');
    submitButton().click();
    fixture.detectChanges();

    expect(el.querySelector('img')?.getAttribute('src')).toBe('https://exemple.fr/pollution.jpg');
  });
});
