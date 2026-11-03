import { HttpInterceptorFn } from '@angular/common/http';
import { Pollution, PollutionRequest } from '../models/pollution';
import { failure, reply } from './mock-http';

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
    return failure(req.url, 404, "Cette pollution n'existe pas ou a été supprimée.");
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
