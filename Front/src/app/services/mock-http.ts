import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';

/** Délai simulé pour que les états « chargement… » restent visibles avec les mocks. */
const LATENCY_MS = 400;

export function reply<T>(url: string, status: number, body: T): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, url, body })).pipe(delay(LATENCY_MS));
}

export function failure(url: string, status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, url, error: { message } })).pipe(
    delay(LATENCY_MS),
  );
}
