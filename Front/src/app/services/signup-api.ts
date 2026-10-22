import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignupRequest, SignupResponse } from '../models/signup';

@Injectable({ providedIn: 'root' })
export class SignupApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/auth/signup`;

  signUp(payload: SignupRequest): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(this.endpoint, payload)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.messageFor(error))),
        ),
      );
  }

  private messageFor(error: HttpErrorResponse): string {
    const fromServer = (error.error as { message?: string } | null)?.message;

    switch (error.status) {
      case 0:
        return "Serveur injoignable : vérifiez que l'API est démarrée.";
      case 400:
        return fromServer ?? 'Les données envoyées ont été refusées par le serveur.';
      case 409:
        return fromServer ?? 'Ce login ou cet email est déjà utilisé.';
      default:
        return fromServer ?? `Inscription impossible (erreur ${error.status}).`;
    }
  }
}
