import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiBaseUrl: 'https://pollution-api-efty.onrender.com/api',
  useSignupApiMock: true,
  usePollutionApiMock: false,
};
