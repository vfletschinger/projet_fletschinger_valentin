import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { Pollution, PollutionRequest } from '../models/pollution';

const LATENCY_MS = 400;

const SAMPLE_POLLUTIONS: Pollution[] = [
  {
    id: 'p-1',
    title: 'Bidons abandonnés',
    type: 'Chimique',
    description: 'Trois bidons percés au bord du ruisseau.',
    observedAt: '2026-09-12',
    place: 'Quai de Seine, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    photoUrl: '',
  },
  {
    id: 'p-2',
    title: 'Sacs plastiques sur la plage',
    type: 'Plastique',
    description: 'Une vingtaine de sacs coincés dans les rochers.',
    observedAt: '2026-10-03',
    place: 'Plage du Prado, Marseille',
    latitude: 43.2598,
    longitude: 5.3747,
    photoUrl: '',
  },
  {
    id: 'p-3',
    title: 'Gravats en lisière de forêt',
    type: 'Dépôt sauvage',
    description: 'Dépôt de gravats et de plaques de plâtre.',
    observedAt: '2026-08-20',
    place: 'Forêt de Fontainebleau',
    latitude: 48.4047,
    longitude: 2.7016,
    photoUrl: '',
  },
];

/** Base en mémoire : elle repart des données d'exemple à chaque rechargement de la page. */
const pollutions = new Map(SAMPLE_POLLUTIONS.map((pollution) => [pollution.id, pollution]));

export const pollutionApiMockInterceptor: HttpInterceptorFn = (req, next) => {
  const match = /\/pollutions(?:\/([^/]+))?$/.exec(req.url);

  if (!match) {
    return next(req);
  }

  const id = match[1];

  if (!id) {
    switch (req.method) {
      case 'GET':
        return reply(req.url, 200, [...pollutions.values()]);
      case 'POST':
        return reply(req.url, 201, save(crypto.randomUUID(), req.body as PollutionRequest));
      default:
        return next(req);
    }
  }

  if (!pollutions.has(id)) {
    return notFound(req.url);
  }

  switch (req.method) {
    case 'GET':
      return reply(req.url, 200, pollutions.get(id));
    case 'PUT':
      return reply(req.url, 200, save(id, req.body as PollutionRequest));
    case 'DELETE':
      pollutions.delete(id);
      return reply(req.url, 204, null);
    default:
      return next(req);
  }
};

function save(id: string, draft: PollutionRequest): Pollution {
  const pollution: Pollution = { ...draft, id };
  pollutions.set(id, pollution);
  return pollution;
}

function reply<T>(url: string, status: number, body: T): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, url, body })).pipe(delay(LATENCY_MS));
}

function notFound(url: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url,
        error: { message: "Cette pollution n'existe pas ou a été supprimée." },
      }),
  ).pipe(delay(LATENCY_MS));
}
