import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Login, Logout } from './auth.actions';
import { AuthStateModel, UserProfile } from './auth.model';

const DEFAULTS: AuthStateModel = { user: null, isAuthenticated: false };

/** Rôle attribué au profil simulé, en attendant qu'un vrai backend le fournisse. */
const DEFAULT_ROLE = 'utilisateur';

/**
 * Tranche `auth` du store : seule source de vérité sur l'utilisateur connecté.
 * Elle est recopiée dans le localStorage par `withNgxsStoragePlugin({ keys: ['auth'] })`
 * (voir `app.config.ts`) et relue au démarrage, ce qui la fait survivre à un F5.
 */
@State<AuthStateModel>({
  name: 'auth',
  defaults: DEFAULTS,
})
@Injectable()
export class AuthState {
  // --- Sélecteurs (lecture) : mémorisés, ils ne se recalculent que si l'état `auth` change. ---

  @Selector()
  static user(state: AuthStateModel): UserProfile | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static username(state: AuthStateModel): string | null {
    return state.user?.nom ?? null;
  }

  // --- Handlers d'actions (écriture) : le seul endroit où l'état `auth` est modifié. ---

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { payload }: Login): void {
    ctx.patchState({
      // Profil simulé : l'id et le rôle seront fournis par l'API JWT à la séance suivante.
      user: { id: Date.now(), email: payload.email, nom: payload.nom, role: DEFAULT_ROLE },
      isAuthenticated: true,
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    ctx.setState(DEFAULTS);
  }
}
