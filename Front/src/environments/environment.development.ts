import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  // `ng serve` interroge l'API Node lancée par `npm run dev` dans ../api
  useApiMock: false,
};
