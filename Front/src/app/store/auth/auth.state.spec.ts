import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

import { Login, Logout } from './auth.actions';
import { AuthState } from './auth.state';

describe('AuthState', () => {
  const payload = { email: 'marie@exemple.fr', nom: 'Marie Dupont' };

  /** Crée un store neuf, configuré comme dans `app.config.ts` (simule un chargement de page). */
  function createStore(): Store {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideStore([AuthState], withNgxsStoragePlugin({ keys: ['auth'] }))],
    });
    return TestBed.inject(Store);
  }

  afterEach(() => localStorage.clear());

  it('démarre déconnecté', () => {
    const store = createStore();

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
    expect(store.selectSnapshot(AuthState.username)).toBeNull();
  });

  it('Login enregistre un profil simulé et marque la session comme ouverte', () => {
    const store = createStore();

    store.dispatch(new Login(payload));

    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.username)).toBe('Marie Dupont');
    expect(store.selectSnapshot(AuthState.user)).toEqual({
      id: expect.any(Number),
      email: 'marie@exemple.fr',
      nom: 'Marie Dupont',
      role: 'utilisateur',
    });
  });

  it("Logout remet l'état initial", () => {
    const store = createStore();
    store.dispatch(new Login(payload));

    store.dispatch(new Logout());

    expect(store.snapshot().auth).toEqual({ user: null, isAuthenticated: false });
  });

  it('survit à un rechargement grâce au localStorage, puis oublie tout à la déconnexion', () => {
    createStore().dispatch(new Login(payload));
    expect(JSON.parse(localStorage.getItem('auth')!)).toMatchObject({ isAuthenticated: true });

    const reloaded = createStore();
    expect(reloaded.selectSnapshot(AuthState.username)).toBe('Marie Dupont');

    reloaded.dispatch(new Logout());
    expect(createStore().selectSnapshot(AuthState.isAuthenticated)).toBe(false);
  });
});
