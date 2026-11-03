import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { Auth } from '../services/auth';
import { UserList } from './user-list';

describe('UserList', () => {
  const url = `${environment.apiBaseUrl}/users`;

  const users: User[] = [
    {
      id: 'u-1',
      login: 'mdupont',
      lastName: 'Dupont',
      firstName: 'Marie',
      email: 'marie@exemple.fr',
      createdAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'u-2',
      login: 'jdurand',
      lastName: 'Durand',
      firstName: 'Jean',
      email: 'jean@exemple.fr',
      createdAt: '2026-09-01T08:30:00.000Z',
    },
  ];

  let fixture: ComponentFixture<UserList>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const names = () =>
    [...el.querySelectorAll('.item-title')].map((title) => title.textContent!.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserList);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('affiche un message pendant le chargement', () => {
    expect(el.textContent).toContain('Chargement des utilisateurs');

    http.expectOne(url).flush(users);
  });

  it("affiche les utilisateurs renvoyés par l'API", async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();

    expect(names()).toEqual(['Marie Dupont', 'Jean Durand']);
    expect(el.textContent).toContain('@mdupont');
    expect(el.textContent).toContain('15/10/2026');
    expect(el.textContent).toContain('2 utilisateur(s)');
  });

  it("indique quand personne n'est inscrit", async () => {
    http.expectOne(url).flush([]);
    await fixture.whenStable();

    expect(el.textContent).toContain('Aucun utilisateur inscrit');
  });

  it("affiche l'erreur quand l'API est injoignable", async () => {
    http.expectOne(url).error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown' });
    await fixture.whenStable();

    expect(el.querySelector('[role="alert"]')!.textContent).toContain('injoignable');
  });

  it('supprime un utilisateur après confirmation', async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    const request = http.expectOne(`${url}/u-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(names()).toEqual(['Jean Durand']);
  });

  it('déconnecte la personne qui supprime son propre compte', async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const auth = TestBed.inject(Auth);
    vi.spyOn(auth, 'user').mockReturnValue(users[0]);
    const logout = vi.spyOn(auth, 'logout');

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();
    http.expectOne(`${url}/u-1`).flush(null, { status: 204, statusText: 'No Content' });

    expect(logout).toHaveBeenCalled();
  });

  it("ne supprime rien si l'utilisateur annule", async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    http.expectNone(`${url}/u-1`);
    expect(names()).toHaveLength(2);
  });
});
