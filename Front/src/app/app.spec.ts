import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { App } from './app';
import { Login } from './store/auth/auth.actions';
import { AuthState } from './store/auth/auth.state';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let el: HTMLElement;

  const hrefs = (selector: string) =>
    [...el.querySelectorAll(selector)].map((link) => link.getAttribute('href'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideStore([AuthState])],
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
    const store = TestBed.inject(Store);
    store.dispatch(new Login({ email: 'marie@exemple.fr', nom: 'Marie Dupont' }));
    fixture.detectChanges();

    expect(el.querySelector('.greeting')!.textContent).toContain('Bonjour, Marie Dupont');
    expect(hrefs('.account a')).toEqual([]);

    el.querySelector<HTMLButtonElement>('button.nav-link')!.click();
    fixture.detectChanges();

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/pollutions']);
    expect(hrefs('.account a')).toEqual(['/connexion', '/inscription']);
  });
});
