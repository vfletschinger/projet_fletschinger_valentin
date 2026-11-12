import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, catchError, throwError } from 'rxjs';

/**
 * Remplace une `HttpErrorResponse` par une `Error` dont le message s'affiche tel quel :
 * celui du serveur (`{ message }`) en priorité, sinon un texte prévu pour ce statut.
 */
export function readableErrors<T>(
  fallbacks: Partial<Record<number, string>> = {},
): MonoTypeOperatorFunction<T> {
  return catchError((error: HttpErrorResponse) =>
    throwError(() => new Error(messageFor(error, fallbacks))),
  );
}

function messageFor(error: HttpErrorResponse, fallbacks: Partial<Record<number, string>>): string {
  if (error.status === 0) {
    return "Serveur injoignable : vérifiez que l'API est démarrée.";
  }

  const fromServer = (error.error as { message?: string } | null)?.message;

  return fromServer ?? fallbacks[error.status] ?? `Opération impossible (erreur ${error.status}).`;
}
