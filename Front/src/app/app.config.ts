import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { apiMockInterceptor } from './services/api-mock';
import { pollutionApiMockInterceptor } from './services/pollution-api-mock';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        ...(environment.useSignupApiMock ? [apiMockInterceptor] : []),
        ...(environment.usePollutionApiMock ? [pollutionApiMockInterceptor] : []),
      ]),
    ),
  ],
};
