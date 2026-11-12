import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { Auth } from '../services/auth';
import { Login } from './login';

describe('Login', () => {
  const url = `${environment.apiBaseUrl}/users/login`;

  const user: User = {
    id: 'u-1',
    login: 'mdupont',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  let fixture: ComponentFixture<Login>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;

  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function fill(id: string, value: string): Promise<void> {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function render(returnUrl?: string): Promise<void> {
    fixture = TestBed.createComponent(Login);
    fixture.componentRef.setInput('returnUrl', returnUrl);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function submit(login = 'mdupont', password = 'Secret123'): Promise<void> {
    await fill('login', login);
    await fill('password', password);
    submitButton().click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it("refuse un login rempli uniquement d'espaces", async () => {
    await render();
    await submit('   ', 'Secret123');

    expect(el.textContent).toContain('Le login est requis.');
    http.expectNone(url);
  });

  it('signale les champs requis au lieu de soumettre un formulaire vide', async () => {
    await render();
    submitButton().click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Le login est requis.');
    expect(el.textContent).toContain('Le mot de passe est requis.');
    http.expectNone(url);
  });

  it("connecte l'utilisateur puis l'emmène sur la page demandée", async () => {
    await render('/pollutions/nouvelle');
    await submit();

    expect(submitButton().disabled).toBe(true);

    const request = http.expectOne(url);
    expect(request.request.body).toEqual({ login: 'mdupont', password: 'Secret123' });
    request.flush(user);

    expect(TestBed.inject(Auth).user()).toEqual(user);
    expect(navigateByUrl).toHaveBeenCalledWith('/pollutions/nouvelle');
  });

  it("revient à la liste quand aucune page n'est demandée", async () => {
    await render();
    await submit();

    http.expectOne(url).flush(user);

    expect(navigateByUrl).toHaveBeenCalledWith('/pollutions');
  });

  it('affiche le refus du serveur et réactive le bouton', async () => {
    await render();
    await submit('mdupont', 'faux');

    http
      .expectOne(url)
      .flush(
        { message: 'Login ou mot de passe incorrect.' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();

    expect(el.querySelector('[role="alert"]')!.textContent).toContain('incorrect');
    expect(submitButton().disabled).toBe(false);
    expect(TestBed.inject(Auth).isLoggedIn()).toBe(false);
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
