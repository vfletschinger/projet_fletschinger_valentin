import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

import { routes } from './app.routes';
import { pollutionApiMockInterceptor } from './services/pollution-api-mock';
import { userApiMockInterceptor } from './services/user-api-mock';
import { AuthState } from './store/auth/auth.state';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors(
        environment.useApiMock ? [userApiMockInterceptor, pollutionApiMockInterceptor] : [],
      ),
    ),
    provideStore(
      [AuthState],
      // Recopie la tranche `auth` dans le localStorage et la relit au démarrage (survit au F5).
      withNgxsStoragePlugin({ keys: ['auth'] }),
      // Branche le store sur l'extension Redux DevTools, en développement uniquement.
      withNgxsReduxDevtoolsPlugin({ disabled: !isDevMode() }),
    ),
  ],
};
