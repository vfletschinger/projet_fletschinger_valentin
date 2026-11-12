import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, User } from '../models/user';
import { UserApi } from './user-api';

const STORAGE_KEY = 'pollution.currentUser';

/**
 * État de l'authentification fictive : l'utilisateur connecté vit dans un signal, recopié en
 * `sessionStorage` pour survivre à un rechargement de la page. Aucun jeton n'est échangé.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly userApi = inject(UserApi);

  private readonly current = signal<User | null>(readStoredUser());

  readonly user = this.current.asReadonly();
  readonly isLoggedIn = computed(() => this.current() !== null);

  login(credentials: LoginRequest): Observable<User> {
    return this.userApi.login(credentials).pipe(tap((user) => this.setUser(user)));
  }

  logout(): void {
    this.setUser(null);
  }

  private setUser(user: User | null): void {
    this.current.set(user);
    try {
      if (user) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Stockage indisponible (navigation privée stricte) : la session reste en mémoire.
    }
  }
}

function readStoredUser(): User | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}
