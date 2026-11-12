import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  // API déployée sur Render (service `pollution-api` de render.yaml)
  apiBaseUrl: 'https://pollution-api-efty.onrender.com/api',
  useApiMock: false,
};
