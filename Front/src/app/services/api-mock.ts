import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { SignupRequest, SignupResponse } from '../models/signup';

const TAKEN_LOGINS = ['admin', 'root'];
const TAKEN_EMAILS = ['deja@exemple.fr'];

const LATENCY_MS = 700;

export const apiMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'POST' || !req.url.endsWith('/auth/signup')) {
    return next(req);
  }

  const payload = (req.body ?? {}) as Partial<SignupRequest>;
  const login = payload.login?.trim() ?? '';
  const email = payload.email?.trim() ?? '';

  if (!login || !email || !payload.password) {
    return conflict(req.url, 400, 'Login, email et mot de passe sont obligatoires.');
  }

  if (TAKEN_LOGINS.includes(login.toLowerCase())) {
    return conflict(req.url, 409, `Le login « ${login} » est déjà pris.`);
  }

  if (TAKEN_EMAILS.includes(email.toLowerCase())) {
    return conflict(req.url, 409, `L'email « ${email} » est déjà associé à un compte.`);
  }

  const created: SignupResponse = {
    id: crypto.randomUUID(),
    login,
    lastName: payload.lastName?.trim() ?? '',
    firstName: payload.firstName?.trim() ?? '',
    email,
    createdAt: new Date().toISOString(),
  };

  return of(
    new HttpResponse({ status: 201, statusText: 'Created', url: req.url, body: created }),
  ).pipe(delay(LATENCY_MS));
};

function conflict(url: string, status: number, message: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: status === 409 ? 'Conflict' : 'Bad Request',
        url,
        error: { message },
      }),
  ).pipe(delay(LATENCY_MS));
}
