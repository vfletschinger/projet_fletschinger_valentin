import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, User, UserRequest } from '../models/user';
import { readableErrors } from '../shared/readable-errors';

const FALLBACK_MESSAGES = {
  401: 'Login ou mot de passe incorrect.',
  404: "Cet utilisateur n'existe pas ou a été supprimé.",
  409: 'Ce login ou cet email est déjà utilisé.',
};

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.endpoint).pipe(readableErrors(FALLBACK_MESSAGES));
  }

  create(request: UserRequest): Observable<User> {
    return this.http.post<User>(this.endpoint, request).pipe(readableErrors(FALLBACK_MESSAGES));
  }

  /** Authentification fictive : l'API vérifie les identifiants et renvoie le compte, sans jeton. */
  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.endpoint}/login`, credentials)
      .pipe(readableErrors(FALLBACK_MESSAGES));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(readableErrors(FALLBACK_MESSAGES));
  }
}
