import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  // API lancée en local avec `npm run dev` dans api/
  apiBaseUrl: 'http://localhost:3000/api',
  useSignupApiMock: true,
  usePollutionApiMock: false,
};
