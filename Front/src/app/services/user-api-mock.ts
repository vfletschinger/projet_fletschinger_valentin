import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, User, UserRequest } from '../models/user';
import { failure, reply } from './mock-http';

const SAMPLE_USERS: User[] = [
  {
    id: 'u-1',
    login: 'admin',
    lastName: 'Martin',
    firstName: 'Alice',
    email: 'admin@exemple.fr',
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'u-2',
    login: 'jdurand',
    lastName: 'Durand',
    firstName: 'Jean',
    email: 'deja@exemple.fr',
    createdAt: '2026-10-12T14:05:00.000Z',
  },
];

/** Mot de passe des comptes d'exemple, pour tester la connexion sans API. */
export const SAMPLE_PASSWORD = 'Secret123';

/** Base en mémoire : elle repart des données d'exemple à chaque rechargement de la page. */
const users = new Map(SAMPLE_USERS.map((user) => [user.id, user]));
/** Mots de passe rangés à part, comme côté serveur : ils ne sortent jamais dans les réponses. */
const passwords = new Map(SAMPLE_USERS.map((user) => [user.id, SAMPLE_PASSWORD]));

export const userApiMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.url.endsWith('/users/login')) {
    return login(req.url, req.body as Partial<LoginRequest>);
  }

  const match = /\/users(?:\/([^/]+))?$/.exec(req.url);

  if (!match) {
    return next(req);
  }

  const id = match[1];

  if (!id) {
    switch (req.method) {
      case 'GET':
        return reply(req.url, 200, [...users.values()]);
      case 'POST':
        return create(req.url, req.body as Partial<UserRequest>);
      default:
        return next(req);
    }
  }

  if (req.method !== 'DELETE') {
    return next(req);
  }

  if (!users.delete(id)) {
    return failure(req.url, 404, "Cet utilisateur n'existe pas ou a été supprimé.");
  }

  passwords.delete(id);
  return reply(req.url, 204, null);
};

function login(
  url: string,
  credentials: Partial<LoginRequest> | null,
): Observable<HttpResponse<User>> {
  const login = credentials?.login?.trim() ?? '';
  const password = credentials?.password ?? '';

  if (!login || !password) {
    return failure(url, 400, 'Le login et le mot de passe sont requis.');
  }

  const user = [...users.values()].find((candidate) => candidate.login === login);

  if (!user || passwords.get(user.id) !== password) {
    return failure(url, 401, 'Login ou mot de passe incorrect.');
  }

  return reply(url, 200, user);
}

/** Reproduit les contrôles du serveur : champs requis puis unicité du login et de l'email. */
function create(url: string, payload: Partial<UserRequest> | null): Observable<HttpResponse<User>> {
  const login = payload?.login?.trim() ?? '';
  const email = payload?.email?.trim().toLowerCase() ?? '';

  if (!login || !email || !payload?.password) {
    return failure(url, 400, 'Login, email et mot de passe sont obligatoires.');
  }

  const taken = [...users.values()].find((user) => user.login === login || user.email === email);

  if (taken) {
    return failure(
      url,
      409,
      taken.login === login
        ? `Le login « ${login} » est déjà pris.`
        : `L'email « ${email} » est déjà associé à un compte.`,
    );
  }

  const user: User = {
    id: crypto.randomUUID(),
    login,
    lastName: payload.lastName?.trim() ?? '',
    firstName: payload.firstName?.trim() ?? '',
    email,
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  passwords.set(user.id, payload.password);

  return reply(url, 201, user);
}
