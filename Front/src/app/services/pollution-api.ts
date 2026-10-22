import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution, PollutionRequest } from '../models/pollution';

@Injectable({ providedIn: 'root' })
export class PollutionApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/pollutions`;

  getAll(): Observable<Pollution[]> {
    return this.withReadableErrors(this.http.get<Pollution[]>(this.endpoint));
  }

  getById(id: string): Observable<Pollution> {
    return this.withReadableErrors(this.http.get<Pollution>(`${this.endpoint}/${id}`));
  }

  create(draft: PollutionRequest): Observable<Pollution> {
    return this.withReadableErrors(this.http.post<Pollution>(this.endpoint, draft));
  }

  update(id: string, draft: PollutionRequest): Observable<Pollution> {
    return this.withReadableErrors(this.http.put<Pollution>(`${this.endpoint}/${id}`, draft));
  }

  delete(id: string): Observable<void> {
    return this.withReadableErrors(this.http.delete<void>(`${this.endpoint}/${id}`));
  }

  private withReadableErrors<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      catchError((error: HttpErrorResponse) => throwError(() => new Error(this.messageFor(error)))),
    );
  }

  private messageFor(error: HttpErrorResponse): string {
    const fromServer = (error.error as { message?: string } | null)?.message;

    switch (error.status) {
      case 0:
        return "Serveur injoignable : vérifiez que l'API est démarrée.";
      case 404:
        return fromServer ?? "Cette pollution n'existe pas ou a été supprimée.";
      default:
        return fromServer ?? `Opération impossible (erreur ${error.status}).`;
    }
  }
}
