import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { User } from './models/user';
import { Auth } from './services/auth';

describe('App', () => {
  const user: User = {
    id: 'u-1',
    login: 'mdupont',
    lastName: 'Dupont',
    firstName: 'Marie',
    email: 'marie@exemple.fr',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  const current = signal<User | null>(null);
  const auth = {
    user: current.asReadonly(),
    logout: vi.fn(() => current.set(null)),
  };

  let fixture: ComponentFixture<App>;
  let el: HTMLElement;

  const hrefs = (selector: string) =>
    [...el.querySelectorAll(selector)].map((link) => link.getAttribute('href'));

  beforeEach(async () => {
    current.set(null);
    auth.logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: Auth, useValue: auth }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('propose la navigation vers les pollutions et les utilisateurs', () => {
    expect(hrefs('.links a')).toEqual(['/pollutions', '/utilisateurs']);
  });

  it('propose connexion et inscription à un visiteur', () => {
    expect(hrefs('.account a')).toEqual(['/connexion', '/inscription']);
    expect(el.querySelector('button.nav-link')).toBeNull();
  });

  it("salue l'utilisateur connecté et permet de se déconnecter", async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    current.set(user);
    fixture.detectChanges();

    expect(el.querySelector('.greeting')!.textContent).toContain('Bonjour, Marie');
    expect(hrefs('.account a')).toEqual([]);

    el.querySelector<HTMLButtonElement>('button.nav-link')!.click();
    fixture.detectChanges();

    expect(auth.logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/pollutions']);
    expect(hrefs('.account a')).toEqual(['/connexion', '/inscription']);
  });
});
