import { Routes } from '@angular/router';
import { authGuard } from '../shared/auth-guard';
import { unsavedChangesGuard } from '../shared/unsaved-changes-guard';

const loadForm = () => import('./pollution-form/pollution-form').then((m) => m.PollutionForm);

/**
 * Routes de la fonctionnalité « pollutions », chargées en lazy loading par `loadChildren` depuis
 * `app.routes.ts`. Chaque écran est lui-même chargé à la demande avec `loadComponent`.
 */
export const POLLUTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pollution-list/pollution-list').then((m) => m.PollutionList),
    title: 'Pollutions signalées',
  },
  {
    // Déclarée avant `:id`, sinon « nouvelle » serait lu comme un identifiant.
    path: 'nouvelle',
    loadComponent: loadForm,
    title: 'Déclarer une pollution',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
    title: "Détail d'une pollution",
  },
  {
    path: ':id/modifier',
    loadComponent: loadForm,
    title: 'Modifier une pollution',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
  },
];
