import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution, PollutionRequest } from '../models/pollution';
import { readableErrors } from '../shared/readable-errors';

const FALLBACK_MESSAGES = { 404: "Cette pollution n'existe pas ou a été supprimée." };

@Injectable({ providedIn: 'root' })
export class PollutionApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}/pollutions`;

  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.endpoint).pipe(readableErrors(FALLBACK_MESSAGES));
  }

  getById(id: string): Observable<Pollution> {
    return this.http
      .get<Pollution>(`${this.endpoint}/${id}`)
      .pipe(readableErrors(FALLBACK_MESSAGES));
  }

  create(draft: PollutionRequest): Observable<Pollution> {
    return this.http.post<Pollution>(this.endpoint, draft).pipe(readableErrors(FALLBACK_MESSAGES));
  }

  update(id: string, draft: PollutionRequest): Observable<Pollution> {
    return this.http
      .put<Pollution>(`${this.endpoint}/${id}`, draft)
      .pipe(readableErrors(FALLBACK_MESSAGES));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(readableErrors(FALLBACK_MESSAGES));
  }
}
