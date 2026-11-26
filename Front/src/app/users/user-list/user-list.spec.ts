import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user';
import { Auth } from '../../services/auth';
import { Confirmation } from '../../services/confirmation';
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

  it("annule le chargement si l'on quitte l'écran avant la réponse", () => {
    const request = http.expectOne(url);

    fixture.destroy();

    // `takeUntilDestroyed` s'est désabonné : HttpClient a interrompu la requête.
    expect(request.cancelled).toBe(true);
  });

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
    vi.spyOn(TestBed.inject(Confirmation), 'ask').mockReturnValue(of(true));

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    const request = http.expectOne(`${url}/u-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(names()).toEqual(['Jean Durand']);
  });

  it('déconnecte et renvoie à la liste la personne qui supprime son propre compte', async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();
    vi.spyOn(TestBed.inject(Confirmation), 'ask').mockReturnValue(of(true));
    const auth = TestBed.inject(Auth);
    vi.spyOn(auth, 'user').mockReturnValue(users[0]);
    const logout = vi.spyOn(auth, 'logout');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();
    http.expectOne(`${url}/u-1`).flush(null, { status: 204, statusText: 'No Content' });

    expect(logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/pollutions']);
  });

  it("ne supprime rien si l'utilisateur annule", async () => {
    http.expectOne(url).flush(users);
    await fixture.whenStable();
    vi.spyOn(TestBed.inject(Confirmation), 'ask').mockReturnValue(of(false));

    el.querySelector<HTMLButtonElement>('.item .btn-danger')!.click();

    http.expectNone(`${url}/u-1`);
    expect(names()).toHaveLength(2);
  });
});
