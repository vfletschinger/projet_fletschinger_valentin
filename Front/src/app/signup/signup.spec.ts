import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { SignupResponse } from '../models/signup';
import { Signup } from './signup';

describe('Signup', () => {
  const url = `${environment.apiBaseUrl}/auth/signup`;

  let fixture: ComponentFixture<Signup>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const createdAccount: SignupResponse = {
    id: 'u-1',
    login: 'mdupont',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  async function fill(id: string, value: string): Promise<void> {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function fillAll(confirm = 'Secret123'): Promise<void> {
    await fill('lastName', 'Dupont');
    await fill('firstName', 'Marie');
    await fill('email', 'marie@exemple.fr');
    await fill('login', 'mdupont');
    await fill('password', 'Secret123');
    await fill('confirmPassword', confirm);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Signup);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('verrouille la soumission tant que le formulaire est vide', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('reste verrouillé si les mots de passe diffèrent', async () => {
    await fillAll('Different1');
    expect(submitButton().disabled).toBe(true);
    expect(el.textContent).toContain('Les mots de passe ne correspondent pas.');
  });

  it("envoie le formulaire à l'API sans la confirmation du mot de passe", async () => {
    await fillAll();
    submitButton().click();
    fixture.detectChanges();

    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'mdupont',
      password: 'Secret123',
      lastName: 'Dupont',
      firstName: 'Marie',
      email: 'marie@exemple.fr',
    });

    request.flush(createdAccount, { status: 201, statusText: 'Created' });
    await fixture.whenStable();

    expect(el.textContent).toContain('Bienvenue, Marie');
    expect(el.textContent).toContain('u-1');
    expect(el.textContent).not.toContain('Secret123');
  });

  it("bloque le bouton pendant l'appel puis affiche l'erreur du serveur", async () => {
    await fillAll();
    submitButton().click();
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().textContent).toContain('Inscription en cours');

    http
      .expectOne(url)
      .flush({ message: 'Ce login est déjà pris.' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(el.textContent).toContain('Ce login est déjà pris.');
    expect(el.textContent).not.toContain('Bienvenue');
    expect(submitButton().disabled).toBe(false);
  });
});
