import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiBaseUrl: '/api',
  // Pas encore d'API déployée : le front simulé répond aussi en production.
  useApiMock: true,
};
